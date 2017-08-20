const twitter = require('twitter');
const snoowrap = require('snoowrap');
const fs = require('fs');
const { env } = process;
const sub = 'circlejerk';


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
    const posts = await r.getSubreddit(sub).getHot({ limit: 15 });

    for (p in posts) {
        const cur = posts[p];

        // if this post is tweetable, tweet it and return
        if (twitterWorthy(cur)) {
            t.post('statuses/update', { status: cur.title }) //man, i hate javascript promises
                .then(function (tweet) {
                    console.log('Tweet sent, recording to file...');
                    fs.writeFile(`${__dirname}/cemetary.txt`, cur.id, function (err) {
                        if (err) {
                            return console.log(err);
                        }

                        console.log(`${cur.id} written to file!`);
                        console.log('Done');
                        return;
                    });
                })
                .catch(function (error) {
                    console.log(error);
                    return;
                });
        }
    }
    async function twitterWorthy(post) {
        // check if title is short enough, then check if it already been posted

        if (post && post.title && post.title.length <= 140) {

            console.log(`Testing: ${post.title}`);

            // promisify fs.readFile() so i can do async/await on fs
            let filePromise = new Promise((resolve, reject) => {
                fs.readFile(`${__dirname}/cemetary.txt`, 'utf8', (err, res) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(res);
                    }
                })
            });

            // now check file to see if its already been tweeted
            const file = await filePromise;

            // parse file for existing id, indexOf returns -1 if id is not in file (true)
            const { id } = post;
            return file.indexOf(id) === -1;
        }
        return false;
    }
}