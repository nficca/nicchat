# nicchat
A very basic chat application written in nodejs.

Check it out at [chat.nicficca.com](http://chat.nicficca.com/)!

## Running it for yourself

You can run the application using docker:
```bash
docker pull nficca/nicchat:latest
docker run -p 9000:9000 -d nficca/nicchat
```

Or with the source code directly:
```bash
git clone https://github.com/nficca/nicchat.git && cd nicchat
npm install
npm start
```

Now open your browser to `http://localhost:9000` and there you have it.
