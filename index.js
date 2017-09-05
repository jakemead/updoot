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
    let posts;
    try {
        posts = await r.getSubreddit(sub).getHot({ limit: 15 });
    } catch (err) {
        throw err;
    }

    // iterate thru posts to find one that hasnt been tweeted
    // then tweet that post and exit;
    for (p in posts) {
        const cur = posts[p];
        // if this post is tweetable, tweet it and return
        if (twitterWorthy(cur)) {
            console.log(`Tweeting ${cur.title}`);
            t.post('statuses/update', { status: cur.title });
            console.log('Tweet sent, recording to file...');
            fs.appendFileSync(`${__dirname}/cemetary.txt`, `${cur.id} `);
            console.log(`${cur.id} saved`);
            process.exit();
        }
    }

   function twitterWorthy(post) {
        // check if title is short enough, then check if it already been posted
        if (post && post.title && post.title.length <= 140) {
            let file = fs.readFileSync(`${__dirname}/cemetary.txt`, 'utf8');
            // parse file for existing id, indexOf returns -1 if id is not in file 
            const { id } = post;
            return file.indexOf(id) === -1;
        }
        return false;
    }
}