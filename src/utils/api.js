import nhost from "../nhost"; // Ensure correct import

const API_BASE_URL = "https://gglrioqykbigsyblybib.hasura.ap-south-1.nhost.run/v1/graphql";

export const fetchNewsData = async () => {
  try {
    const session = await nhost.auth.getSession();
    if (!session) {
      console.error("🚨 User is not logged in. Redirecting to login...");
      window.location.href = "/login"; // Redirect user to login
      return [];
    }

    const token = session.accessToken;
    console.log("✅ Got token:", token);

    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: `
          query {
            sentiment_analysis {
              id
              news_title
              news_content
              sentiment
              created_at
              news_summary
              news_author
              news_url
            }
          }
        `,
      }),
    });

    const result = await response.json();
    console.log("📌 API Response:", result);

    if (result.errors) {
      console.error("❌ GraphQL Errors:", result.errors);
    }

    return result.data ? result.data.sentiment_analysis : [];
  } catch (error) {
    console.error("⚠️ Error fetching news data:", error);
    return [];
  }
};
