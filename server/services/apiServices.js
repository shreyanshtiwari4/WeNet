const axios = require("axios");

const getCategoriesFromTextRazor = async (content, timeout) => {
  const API_KEY = process.env.TEXTRAZOR_API_KEY;
  const API_URL = process.env.TEXTRAZOR_API_URL;

  if (!API_KEY || !API_URL) {
    throw new Error("TextRazor API_KEY or API_URL is not set");
  }

  const categories = {};

  const source = axios.CancelToken.source();
  const timeoutId = setTimeout(() => {
    source.cancel("TextRazor request timed out");
  }, timeout);

  try {
    const response = await axios.post(
      API_URL,
      {
        text: content,
        classifiers: "community",
        cleanup: {
          mode: "stripTags",
        },
      },
      {
        headers: {
          "X-TextRazor-Key": API_KEY,
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept-Encoding": "gzip",
        },
        cancelToken: source.token,
      }
    );

    if (response.data.response.categories) {
      response.data.response.categories.forEach(({ label, score }) => {
        categories[label] = score;
      });
    }

    return categories;
  } catch (error) {
    if (axios.isCancel(error)) {
      // throw new Error(`TextRazor request cancelled: ${error.message}`);
      console.log(`TextRazor request cancelled: ${error.message}`);
      return categories; // Return empty categories if cancelled
    } else {
      const { status, statusText } = error.response;
      throw new Error(`Error fetching categories from TextRazor: ${status} ${statusText}`);
    }
  } finally {
    clearTimeout(timeoutId);
  }
};

const getCategoriesFromClassifierAPI = async (content, timeout) => {
  const CLASSIFIER_API_URL = process.env.CLASSIFIER_API_URL;
  if (!CLASSIFIER_API_URL) {
    throw new Error("Classifier API_URL is not set");
  }

  const scoreThreshold = 0.2;
  const categories = {};

  const source = axios.CancelToken.source();
  const timeoutId = setTimeout(() => {
    source.cancel("Classifier API request timed out");
  }, timeout);

  try {
    const response = await axios.post(
      CLASSIFIER_API_URL,
      { 
        text: content 
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        cancelToken: source.token,
      }
    );

    if (response.data.response.categories) {
      response.data.response.categories.forEach(({ label, score }) => {
        if (score > scoreThreshold) {
          categories[label] = score;
        }
      });
    }

    return categories;
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log(`Classifier API request cancelled: ${error.message}`);
      return categories; // Return empty categories if cancelled
    } else {
      const { status, statusText } = error.response;
      throw new Error(`Error fetching categories from Classifier API: ${status} ${statusText}`);
    }
  } finally {
    clearTimeout(timeoutId);
  }
};

const getCategoriesFromInterfaceAPI = async (content, timeout) => {
  const API_URL = process.env.INTERFACE_API_URL;
  const API_KEY = process.env.INTERFACE_API_KEY;

  const scoreThreshold = 0.2;

  if (!API_URL || !API_KEY) {
    throw new Error("Interface API_URL or API_KEY is not set");
  }

  const CANDIDATE_LABELS = [
    "Programming",
    "Health and Fitness",
    "Travel",
    "Food and Cooking",
    "Music",
    "Sports",
    "Fashion",
    "Art and Design",
    "Business and Entrepreneurship",
    "Education",
  ];

  const categories = {};

  const source = axios.CancelToken.source();
  const timeoutId = setTimeout(() => {
    source.cancel("Interface API request timed out");
  }, timeout);

  try {
    const response = await axios.post(
      API_URL,
      {
        inputs: content,
        parameters: { candidate_labels: CANDIDATE_LABELS },
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        cancelToken: source.token,
      }
    );

    const { labels, scores } = response.data;

    labels.forEach((label, index) => {
      const score = scores[index];
      if (score >= scoreThreshold) {
        categories[label] = score;
      }
    });

    return categories;
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log(`Interface API request cancelled: ${error.message}`);
      return categories; // Return empty categories if cancelled
    } else {
      const { status, statusText } = error.response;
      throw new Error(`Error fetching categories from Interface API: ${status} ${statusText}`);
    }
  } finally {
    clearTimeout(timeoutId);
  }
};

module.exports = {
  getCategoriesFromTextRazor,
  getCategoriesFromClassifierAPI,
  getCategoriesFromInterfaceAPI,
};