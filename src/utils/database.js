// Database utility functions for nhost operations

export const updatePreferences = async (nhostClient, userId, preferences) => {
    try {
      const response = await nhostClient.graphql.request(`
        mutation UpdateUserPreferences($user_id: uuid!, $preferences: jsonb!, $display_mode: String!) {
          update_user_profiles(
            where: { id: { _eq: $user_id } },
            _set: { 
              preferences: $preferences,
              display_mode: $display_mode
            }
          ) {
            returning {
              preferences
              display_mode
            }
          }
        }
      `, {
        user_id: userId,
        preferences: { preferences: preferences.preferences },
        display_mode: preferences.display_mode
      });
  
      if (response.error) {
        throw new Error(response.error.message);
      }
  
      return response.data?.update_user_profiles?.returning[0];
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  };
  
  export const saveArticle = async (nhostClient, userId, newArticle) => {
    try {
        console.log("🔹 Fetching existing saved articles...");

        // Step 1: Fetch existing saved articles
        const fetchResponse = await nhostClient.graphql.request(`
            query GetSavedArticles($user_id: uuid!) {
                user_profiles_by_pk(id: $user_id) {
                    saved_articles
                }
            }
        `, { user_id: userId });

        console.log("🔹 Fetch Response:", fetchResponse);

        if (fetchResponse.errors) {
            console.error("❌ Fetch Error:", fetchResponse.errors);
            throw new Error(fetchResponse.errors[0].message);
        }

        let existingArticles = fetchResponse.data?.user_profiles_by_pk?.saved_articles;

        // Step 2: Ensure existingArticles is always an array
        if (!Array.isArray(existingArticles)) {
            existingArticles = [];
        }

        console.log("🔹 Existing Articles:", existingArticles);

        // Step 3: Check if the article already exists
        const isAlreadySaved = existingArticles.some(article => article.id === newArticle.id);

        console.log("🔹 Is Article Already Saved?", isAlreadySaved);

        // Step 4: If already saved, remove it; otherwise, add it
        let updatedArticles;
        if (isAlreadySaved) {
            updatedArticles = existingArticles.filter(article => article.id !== newArticle.id);
        } else {
            updatedArticles = [...existingArticles, newArticle];
        }

        console.log("🔹 Updated Articles:", updatedArticles);

        // Step 5: Convert updatedArticles to valid JSON for Hasura
        const updatedArticlesJSON = JSON.stringify(updatedArticles);

        console.log("🔹 JSON Formatted Articles:", updatedArticlesJSON);

        // Step 6: Update the saved articles in the database
        const updateResponse = await nhostClient.graphql.request(`
            mutation UpdateSavedArticles($user_id: uuid!, $articles: jsonb!) {
                update_user_profiles(
                    where: { id: { _eq: $user_id } },
                    _set: { saved_articles: $articles }
                ) {
                    returning {
                        saved_articles
                    }
                }
            }
        `, {
            user_id: userId,
            articles: updatedArticlesJSON // Use JSON formatted string
        });

        console.log("🔹 Update Response:", updateResponse);

        if (updateResponse.errors) {
            console.error("❌ Update Error:", updateResponse.errors);
            throw new Error(updateResponse.errors[0].message);
        }

        return updateResponse.data?.update_user_profiles?.returning[0];

    } catch (error) {
        console.error('❌ Error saving article:', error);
        throw error;
    }
};



export const markArticleAsRead = async (nhostClient, userId, article) => {
    try {
        console.log("🔹 Fetching existing read articles...");

        // Step 1: Fetch existing read articles
        const fetchResponse = await nhostClient.graphql.request(`
            query GetReadArticles($user_id: uuid!) {
                user_profiles_by_pk(id: $user_id) {
                    read_articles
                }
            }
        `, { user_id: userId });

        console.log("🔹 Fetch Response:", fetchResponse);

        if (fetchResponse.errors) {
            console.error("❌ Fetch Error:", fetchResponse.errors);
            throw new Error(fetchResponse.errors[0].message);
        }

        let existingReadArticles = fetchResponse.data?.user_profiles_by_pk?.read_articles;

        // Step 2: Ensure existingReadArticles is always an array
        if (!Array.isArray(existingReadArticles)) {
            existingReadArticles = [];
        }

        console.log("🔹 Existing Read Articles:", existingReadArticles);

        // Step 3: Check if the article is already marked as read
        const isAlreadyRead = existingReadArticles.some(a => a.id === article.id);

        console.log("🔹 Is Article Already Read?", isAlreadyRead);

        // Step 4: If already read, remove it; otherwise, add it
        let updatedReadArticles;
        if (isAlreadyRead) {
            updatedReadArticles = existingReadArticles.filter(a => a.id !== article.id);
        } else {
            updatedReadArticles = [...existingReadArticles, article];
        }

        console.log("🔹 Updated Read Articles:", updatedReadArticles);

        // Step 5: Convert updatedReadArticles to JSON string
        const updatedReadArticlesJSON = JSON.stringify(updatedReadArticles);

        console.log("🔹 JSON Formatted Read Articles:", updatedReadArticlesJSON);

        // Step 6: Update the read articles in the database
        const updateResponse = await nhostClient.graphql.request(`
            mutation UpdateReadArticles($user_id: uuid!, $articles: jsonb!) {
                update_user_profiles(
                    where: { id: { _eq: $user_id } },
                    _set: { read_articles: $articles }
                ) {
                    returning {
                        read_articles
                    }
                }
            }
        `, {
            user_id: userId,
            articles: updatedReadArticlesJSON // Use JSON formatted string
        });

        console.log("🔹 Update Response:", updateResponse);

        if (updateResponse.errors) {
            console.error("❌ Update Error:", updateResponse.errors);
            throw new Error(updateResponse.errors[0].message);
        }

        return updateResponse.data?.update_user_profiles?.returning[0];

    } catch (error) {
        console.error('❌ Error marking article as read:', error);
        throw error;
    }
};

  
export const fetchUserProfile = async (nhostClient, userId) => {
    try {
        console.log("🔹 Fetching user profile...");

        // Step 1: Query the database for user profile
        const response = await nhostClient.graphql.request(`
            query GetUserProfile($user_id: uuid!) {
                user_profiles_by_pk(id: $user_id) {
                    preferences
                    saved_articles
                    read_articles
                    display_mode
                }
            }
        `, { user_id: userId });

        console.log("🔹 Fetch Response:", response);

        // Step 2: Handle potential errors
        if (response.errors) {
            console.error("❌ Fetch Error:", response.errors);
            throw new Error(response.errors[0].message);
        }

        // Step 3: Extract user profile data, ensuring default values if null
        const userProfile = response.data?.user_profiles_by_pk || {
            preferences: { preferences: [] },
            saved_articles: [],
            read_articles: [],
            display_mode: 'all'
        };

        console.log("✅ Retrieved User Profile:", userProfile);

        return userProfile;

    } catch (error) {
        console.error('❌ Error fetching user profile:', error);
        throw error;
    }
};
