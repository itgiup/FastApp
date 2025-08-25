import type { FC } from "react";

export const Loading: FC = () => (
  <>
    <style>{`
      body {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans',
          'Helvetica Neue', sans-serif;
      }

      .loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        color: white;
      }

      .loading img {
        width: 48px;
        height: 48px;
        animation: spin 1.2s linear infinite;
      }

      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }

        100% {
          transform: rotate(360deg);
        }
      }

      .loading p {
        margin-top: 10px;
        font-size: 1.2em;
        animation: fadeIn 1.5s ease-in-out infinite alternate;
      }

      @keyframes fadeIn {
        from {
          opacity: 0.5;
        }

        to {
          opacity: 1;
        }
      }
    `}</style>
    <div className="loading">
      <img src="/images/logox48.png" alt="Loading..." />
      <p>Loading...</p>
    </div>
  </>
);
