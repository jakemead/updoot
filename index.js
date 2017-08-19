const twitter = require('twitter');
const snoowrap = require('snoowrap');
const fs = require('fs');
const { env } = process;
const circlejerk = 'circlejerk';



const r = new snoowrap({
    clientId: env.clientId,
    clientSecret: env.clientSecret,
    refreshToken: env.refreshToken,
    userAgent: env.userAgent
});
const t = new twitter({
    consumer_key: env.consumer_key,
    consumer_secret: env.consumer_secret,
    access_token_key: env.access_token_key,
    access_token_secret: env.access_token_secret
});

run();

async function run() {
    const posts = await r.getSubreddit(circlejerk).getHot({ limit: 15 });

    for (p in posts) {
        const cur = posts[p];

        // if this post is tweetable, tweet it and bail out of the loop
        if (twitterWorthy(cur)) {
            console.log(`Post found!`);
            t.post('statuses/update', { status: cur.title })
                .then(function (tweet) {
                    console.log(`TWEET: ${cur.title}`);
                    record(cur);
                    break;
                })
                .catch(function (error) {
                    throw error;
                })
        }
    }
    console.log('Done');
    function twitterWorthy(post) {
        // check if title is short enough, then check if it already been posted

        if (post && post.title && post.title.length <= 140) {

            console.log(`Testing: ${post.title}`);
            // now check file to see if its already been tweeted
            const { id } = post;

            fs.readFile(`${__dirname}/cemetary.txt`, 'utf8', (err, data) => {
                if (err) { return false }

                // parse file for existing id
                return data.indexOf(id) >= 0;
            });
        }
        return false;
    }

    function record(post) {
        var fs = require('fs');
        fs.writeFile("/tmp/test", "Hey there!", function (err) {
            if (err) {
                return console.log(err);
            }

            console.log("The file was saved!");
        });
    }
}