import React, { useEffect, useMemo } from "react";
import { useAuthRequest } from "expo-auth-session";
import { Button } from "tamagui";
import { useOAuthCallback } from "../hooks";
import { useServerConfig } from "@/hooks/useServerConfig";

const LoginGitlabButton = () => {
  const { data: clientId } = useServerConfig("gitlab_client_id");
  const discovery = useMemo(() => {
    return {
      authorizationEndpoint: "https://gitlab.com/oauth/authorize",
      tokenEndpoint: "https://gitlab.com/oauth/token",
      revocationEndpoint: "https://gitlab.com/oauth/revoke",
    };
  }, [clientId]);
  const oauth = useOAuthCallback("gitlab");

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId,
      scopes: ["read_user"],
      // redirectUri: makeRedirectUri({ scheme: appConfig.scheme }),
      redirectUri: "http://localhost:8081",
    },
    discovery
  );

  useEffect(() => {
    if (response?.type === "success") {
      const { code } = response.params;
      const verifier = request?.codeVerifier;
      oauth.mutate({ code, verifier });
    }
  }, [response]);

  return (
    <Button disabled={!request} onPress={() => promptAsync()}>
      Login with Gitlab
    </Button>
  );
};

export default LoginGitlabButton;
