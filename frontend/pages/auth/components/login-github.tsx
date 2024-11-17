import React, { useEffect, useMemo } from "react";
import { makeRedirectUri, useAuthRequest } from "expo-auth-session";
import appConfig from "@/app.json";
import { Button } from "tamagui";
import { useOAuthCallback } from "../hooks";
import { useServerConfig } from "@/hooks/useServerConfig";

const LoginGithubButton = () => {
  const { data: clientId } = useServerConfig("github_client_id");
  const discovery = useMemo(() => {
    return {
      authorizationEndpoint: "https://github.com/login/oauth/authorize",
      tokenEndpoint: "https://github.com/login/oauth/access_token",
      revocationEndpoint: `https://github.com/settings/connections/applications/${clientId}`,
    };
  }, [clientId]);
  const oauth = useOAuthCallback("github");

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: clientId,
      scopes: ["identity"],
      redirectUri: makeRedirectUri({ scheme: appConfig.scheme }),
    },
    discovery
  );

  useEffect(() => {
    if (response?.type === "success") {
      const { code } = response.params;
      oauth.mutate(code);
    }
  }, [response]);

  return (
    <Button disabled={!request} onPress={() => promptAsync()}>
      Login with Github
    </Button>
  );
};

export default LoginGithubButton;
