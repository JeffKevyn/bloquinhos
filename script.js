const styles = `
    .badge {
        margin-left: 4px;
        font-size: 14px;
    }
    
    .verified {
        color: #1DA1F2;
    }
    
    .dev {
        color: #6e5494;
    }
    
    .premium {
        color: #FFD700;
    }
    
    .tweet-name-container {
        display: flex;
        align-items: center;
        gap: 4px;
    }
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);
  
function toggleLike(tweetId) {
    const tweetRef = database.ref('tweets/' + tweetId);
    
    tweetRef.transaction((tweet) => {
        if (tweet) {
            if (!tweet.likedBy) {
                tweet.likedBy = {};
            }
            
            if (tweet.likedBy[userId]) {
                tweet.likes--;
                tweet.likedBy[userId] = null;
            } else {
                tweet.likes = (tweet.likes || 0) + 1;
                tweet.likedBy[userId] = true;
            }
        }
        return tweet;
    });
}
  