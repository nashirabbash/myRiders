/**
 * useShareCard - Share card generation hook
 * Generates ride summary cards with Skia canvas and opens native share sheet
 */

import { useState } from "react";
import { Skia } from "@shopify/react-native-skia";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { Ride } from "../types";
import { VEHICLE_CONFIG } from "../constants/vehicles";
import { formatDuration } from "../utils/metrics";
import { decodePolyline } from "../utils/polyline";

const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1920;

export function useShareCard() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateAndShare = async (ride: Ride): Promise<void> => {
    setIsGenerating(true);
    // @ts-ignore - cacheDirectory exists but TypeScript definitions may be outdated
    const tempUri = `${FileSystem.cacheDirectory}ride_${ride.id}.png`;

    try {
      const cfg = VEHICLE_CONFIG[ride.vehicle_type];
      const rideTitle = ride.title ?? `${cfg.label} ride`;
      const rideDate = new Date(ride.started_at).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      // Create Skia canvas
      const surface = Skia.Surface.Make(CARD_WIDTH, CARD_HEIGHT)!;
      const canvas = surface.getCanvas();
      const paint = Skia.Paint();

      // Layer 0 — Background
      paint.setColor(Skia.Color(cfg.bgColor));
      canvas.drawRect(Skia.XYWHRect(0, 0, CARD_WIDTH, CARD_HEIGHT), paint);

      // Layer 1 — Polyline (if available)
      const encoded = ride.route_summary?.polyline;
      if (encoded) {
        const pts = decodePolyline(encoded, CARD_WIDTH, CARD_HEIGHT);
        const offsetY = CARD_HEIGHT * 0.22;

        if (pts.length > 1) {
          // Glow line
          const glowPaint = Skia.Paint();
          glowPaint.setColor(Skia.Color(cfg.color + "33"));
          glowPaint.setStrokeWidth(18);
          glowPaint.setStyle(1); // STROKE

          // Main line
          const linePaint = Skia.Paint();
          linePaint.setColor(Skia.Color(cfg.color));
          linePaint.setStrokeWidth(7);
          linePaint.setStyle(1); // STROKE
          linePaint.setStrokeCap(1); // ROUND
          linePaint.setStrokeJoin(1); // ROUND

          const path = Skia.Path.Make();
          path.moveTo(pts[0].x, pts[0].y + offsetY);
          for (let i = 1; i < pts.length; i++) {
            const mx = (pts[i - 1].x + pts[i].x) / 2;
            const my = (pts[i - 1].y + pts[i].y) / 2 + offsetY;
            path.quadTo(pts[i - 1].x, pts[i - 1].y + offsetY, mx, my);
          }

          canvas.drawPath(path, glowPaint);
          canvas.drawPath(path, linePaint);

          // Start marker
          paint.setColor(Skia.Color(cfg.color + "66"));
          canvas.drawCircle(pts[0].x, pts[0].y + offsetY, 14, paint);
          // End marker
          paint.setColor(Skia.Color(cfg.color));
          canvas.drawCircle(
            pts[pts.length - 1].x,
            pts[pts.length - 1].y + offsetY,
            18,
            paint,
          );
        }
      }

      // Layer 2 — Header text
      const titleFont = Skia.Font(undefined, 56);
      const subFont = Skia.Font(undefined, 30);
      paint.setColor(Skia.Color("#FFFFFF"));
      canvas.drawText(rideTitle, 60, 110, paint, titleFont);
      paint.setColor(Skia.Color("#FFFFFF88"));
      canvas.drawText(rideDate, 60, 158, paint, subFont);

      // Layer 3 — Metric card
      const cardBg = Skia.Paint();
      cardBg.setColor(Skia.Color("#0000008C"));
      canvas.drawRRect(
        Skia.RRectXY(
          Skia.XYWHRect(48, CARD_HEIGHT - 480, CARD_WIDTH - 96, 210),
          20,
          20,
        ),
        cardBg,
      );

      const metrics = buildMetricValues(ride);
      const valFont = Skia.Font(undefined, 52);
      const lblFont = Skia.Font(undefined, 26);
      const cellW = (CARD_WIDTH - 96) / metrics.length;

      metrics.forEach((m, i) => {
        const x = 48 + cellW * i + 24;
        paint.setColor(Skia.Color(i === 0 ? cfg.color : "#FFFFFF"));
        canvas.drawText(
          `${m.value}${m.unit}`,
          x,
          CARD_HEIGHT - 420,
          paint,
          valFont,
        );
        paint.setColor(Skia.Color("#FFFFFF55"));
        canvas.drawText(m.label, x, CARD_HEIGHT - 360, paint, lblFont);
      });

      // Layer 4 — Logo
      const logoFont = Skia.Font(undefined, 28);
      paint.setColor(Skia.Color("#FFFFFF88"));
      canvas.drawText(
        "TRACKRIDE",
        CARD_WIDTH - 260,
        CARD_HEIGHT - 60,
        paint,
        logoFont,
      );
      paint.setColor(Skia.Color(cfg.color));
      canvas.drawCircle(CARD_WIDTH - 278, CARD_HEIGHT - 72, 10, paint);

      // Export image
      const image = surface.makeImageSnapshot();
      const base64 = image.encodeToBase64();

      await FileSystem.writeAsStringAsync(tempUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Save to gallery if permitted
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === "granted") {
        try {
          await MediaLibrary.saveToLibraryAsync(tempUri);
        } catch (e) {
          console.warn("[ShareCard] Could not save to gallery:", e);
        }
      }

      // Open native share sheet
      await Sharing.shareAsync(tempUri, {
        mimeType: 'image/png',
        dialogTitle: `Bagikan ${rideTitle}`,
        UTI: 'public.png',
      })
    } finally {
      // Always clean up temporary file, even if sharing/saving fails
      try {
        await FileSystem.deleteAsync(tempUri, { idempotent: true });
      } catch (e) {
        console.error("[ShareCard] Error cleaning up temp file:", e);
      }
      setIsGenerating(false);
    }
  };

  return { generateAndShare, isGenerating };
}

/**
 * Build metric display values based on vehicle type
 */
function buildMetricValues(
  ride: Ride,
): Array<{ value: string; unit: string; label: string }> {
  const vehicleType = ride.vehicle_type;

  if (vehicleType === "motor") {
    return [
      {
        value: ride.max_speed_kmh.toFixed(0),
        unit: " km/h",
        label: "kec. maks",
      },
      { value: ride.distance_km.toFixed(1), unit: " km", label: "jarak" },
      {
        value: formatDuration(ride.duration_seconds),
        unit: "",
        label: "durasi",
      },
    ];
  }

  if (vehicleType === "mobil") {
    return [
      { value: ride.distance_km.toFixed(1), unit: " km", label: "jarak" },
      {
        value: ride.route_summary?.cities?.join("→") ?? "-",
        unit: "",
        label: "rute kota",
      },
      {
        value: formatDuration(ride.duration_seconds),
        unit: "",
        label: "durasi",
      },
    ];
  }

  // sepeda
  return [
    { value: String(ride.calories), unit: " kal", label: "kalori" },
    { value: ride.distance_km.toFixed(1), unit: " km", label: "jarak" },
    {
      value: String(Math.round(ride.elevation_m)),
      unit: " m",
      label: "elevasi",
    },
  ];
}
