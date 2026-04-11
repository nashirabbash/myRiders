import { Button, Input } from "heroui-native";
import React from "react";
import { Text, View } from "react-native";
import { AuthTemplateProps } from "./type";

const fieldErrors = {
  // Login Screen Errors
  login: {
    email: {
      empty: "Email is required",
      invalid: "Please enter a valid email address",
      notFound: "Email address not found",
    },
    password: {
      empty: "Password is required",
      incorrect: "Password is incorrect",
      tooShort: "Password must be at least 8 characters",
    },
  },
  // Register/SignUp Screen Errors
  register: {
    fullName: {
      empty: "Full name is required",
      tooShort: "Full name must be at least 2 characters",
      tooLong: "Full name must not exceed 50 characters",
      invalid: "Full name can only contain letters and spaces",
    },
    email: {
      empty: "Email is required",
      invalid: "Please enter a valid email address",
      alreadyTaken: "Email has already been taken",
      notVerified: "Please verify your email address",
    },
    username: {
      empty: "Username is required",
      tooShort: "Username must be at least 3 characters",
      tooLong: "Username must not exceed 20 characters",
      alreadyTaken: "Username is already taken",
      invalid: "Username can only contain letters, numbers, and underscores",
    },
    password: {
      empty: "Password is required",
      tooShort: "Password must be at least 8 characters",
      tooWeak:
        "Password must contain uppercase, lowercase, number, and special character",
      noUppercase: "Password must contain at least one uppercase letter",
      noLowercase: "Password must contain at least one lowercase letter",
      noNumber: "Password must contain at least one number",
      noSpecial:
        "Password must contain at least one special character (!@#$%^&*)",
    },
    confirmPassword: {
      empty: "Please confirm your password",
      mismatch: "Passwords do not match",
    },
  },
  // Forgot Password Screen Errors
  forgotPassword: {
    email: {
      empty: "Email is required",
      invalid: "Please enter a valid email address",
      notFound: "Email address not found in our system",
      noAccount: "No account found with this email",
    },
  },
  // Global/Network Errors
  global: {
    network: "Network error. Please check your connection and try again",
    server: "Server error. Please try again later",
    timeout: "Request timed out. Please try again",
    unauthorized: "Unauthorized access. Please log in again",
    tooManyAttempts: "Too many login attempts. Please try again later",
  },
};

const content = [
  {
    Login: [
      {
        name: "email",
        placeholder: "Email",
        errorKey: "empty",
        defaultError: fieldErrors.login.email.empty,
      },
      {
        name: "password",
        placeholder: "Password",
        errorKey: "empty",
        defaultError: fieldErrors.login.password.empty,
        secureTextEntry: true,
      },
      { text: "Login" },
    ],
  },
  {
    SignUp: [
      {
        NameInputScreen: [
          {
            name: "fullName",
            placeholder: "Full Name",
            errorKey: "empty",
            defaultError: fieldErrors.register.fullName.empty,
          },
          { text: "Next" },
        ],
      },
      {
        EmailInputScreen: [
          {
            name: "email",
            placeholder: "Email",
            errorKey: "empty",
            defaultError: fieldErrors.register.email.empty,
          },
          { text: "Next" },
        ],
      },
      {
        Username: [
          {
            name: "username",
            placeholder: "Username",
            errorKey: "empty",
            defaultError: fieldErrors.register.username.empty,
          },
          { text: "Next" },
        ],
      },
      {
        PasswordInputScreen: [
          {
            name: "password",
            placeholder: "Password",
            errorKey: "empty",
            defaultError: fieldErrors.register.password.empty,
            secureTextEntry: true,
          },
          { text: "Next" },
        ],
      },
      {
        ConfirmPasswordScreen: [
          {
            name: "confirmPassword",
            placeholder: "Confirm Password",
            errorKey: "empty",
            defaultError: fieldErrors.register.confirmPassword.empty,
            secureTextEntry: true,
          },
          { text: "Next" },
        ],
      },
    ],
  },
  {
    ForgotPassword: [
      {
        name: "email",
        placeholder: "Email",
        errorKey: "empty",
        defaultError: fieldErrors.forgotPassword.email.empty,
      },
      { text: "Send Reset Link" },
    ],
  },
];

export default function AuthTemplate(props: AuthTemplateProps) {
  const renderContent = () => {
    switch (props.screen) {
      case "login": {
        const loginContent = content[0]?.Login ?? [];
        return (
          <View className="flex flex-col items-center w-full gap-4 h-full">
            <View className="flex flex-col items-center w-full gap-4">
              {loginContent.map((item: any, idx: number) =>
                item.placeholder ? (
                  <View key={idx} className="w-full">
                    <Input
                      className="w-full"
                      placeholder={item.placeholder}
                      secureTextEntry={item.secureTextEntry}
                      isInvalid={!!props.errors?.[item.name]}
                    />
                    {props.errors?.[item.name] && (
                      <Text className="text-red-500 text-xs mt-1">
                        {props.errors[item.name]}
                      </Text>
                    )}
                  </View>
                ) : null,
              )}
            </View>
            <Button className="w-full">{loginContent[2]?.text}</Button>
          </View>
        );
      }
      case "register": {
        const registerContent = content[1]?.SignUp ?? [];
        const currentStep = props.registerStep;
        const stepContent = registerContent.find((step: any) =>
          Object.keys(step)[0]
            .toLowerCase()
            .includes(currentStep ?? ""),
        );
        if (!stepContent) return null;
        const stepKey = Object.keys(stepContent)[0];
        const stepItems = ((stepContent as any)[stepKey] as any[]) ?? [];
        return (
          <View className="flex flex-col items-center w-full gap-4">
            {stepItems.map((item: any, idx: number) =>
              item.placeholder ? (
                <View key={idx} className="w-full">
                  <Input
                    className="w-full"
                    placeholder={item.placeholder}
                    secureTextEntry={item.secureTextEntry}
                    isInvalid={!!props.errors?.[item.name]}
                  />
                  {props.errors?.[item.name] && (
                    <Text className="text-red-500 text-xs mt-1">
                      {props.errors[item.name]}
                    </Text>
                  )}
                </View>
              ) : null,
            )}
            <Button className="w-full">
              {stepItems[stepItems.length - 1]?.text}
            </Button>
          </View>
        );
      }
      case "forgot-password": {
        const forgotPasswordContent = content[2]?.ForgotPassword ?? [];
        return (
          <View className="flex flex-col items-center w-full gap-4">
            {forgotPasswordContent.map((item: any, idx: number) =>
              item.placeholder ? (
                <View key={idx} className="w-full">
                  <Input
                    className="w-full"
                    placeholder={item.placeholder}
                    isInvalid={!!props.errors?.[item.name]}
                  />
                  {props.errors?.[item.name] && (
                    <Text className="text-red-500 text-xs mt-1">
                      {props.errors[item.name]}
                    </Text>
                  )}
                </View>
              ) : null,
            )}
            <Button className="w-full">
              {forgotPasswordContent[forgotPasswordContent.length - 1]?.text}
            </Button>
          </View>
        );
      }
    }
  };
  return renderContent();
}
