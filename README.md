# WebRTC Direct Media Call

This project is a simple web application that demonstrates a direct peer-to-peer audio and video call using WebRTC. The application uses a Node.js server with Socket.IO for signaling to establish the connection between two clients. Once the connection is established, the media (audio and video) is streamed directly between the peers.

This is a skeletal example for establishing direct media between two site visitors. The signaling travels through the application, but the media is end-to-end encrypted between the peers.

## Features

* **Direct Media Connection**: Audio and video are streamed directly between the two participants, ensuring low latency and privacy.
* **Signaling Server**: A simple signaling server using Node.js, Express, and Socket.IO is provided to facilitate the WebRTC connection setup.
* **Dockerized**: The entire application stack (web server and signaling server) can be easily deployed using Docker Compose.
* **Mute/Unmute**: Users can mute and unmute their audio during a call.
* **Public Domain**: This software is released into the public domain and is free to use, modify, and distribute.

## How It Works

1.  **User A opens the web page.** Their browser gets the frontend code from the Nginx web server.
2.  **User B opens the web page.**
3.  **User A clicks "Connect to Room".**
    * Their browser requests access to their camera and microphone.
    * A `RTCPeerConnection` object is created.
    * An "offer" is generated and sent to the signaling server via Socket.IO.
4.  **User B clicks "Connect to Room".**
    * Their browser also gets access to its camera and microphone.
    * They receive the "offer" from User A via the signaling server.
    * They create an "answer" and send it back to User A via the signaling server.
5.  **ICE candidates are exchanged** through the signaling server to handle network address translation (NAT).
6.  Once the connection is established, the audio and video are streamed directly between User A and User B.

## Deployment

### Prerequisites

* Docker and Docker Compose
* A registered public domain name (e.g., `your-domain.com`).
* A Cloudflare account.

### Step 1: Clone the Repository

Get the source code on your local machine or server.

```bash
git clone [https://github.com/absginc/webrtc-call-directmedia.git](https://github.com/absginc/webrtc-call-directmedia.git)
cd webrtc-call-directmedia
```

### Step 2: Configure Your Public Domain in the Code

**IMPORTANT**: Modern browsers require a secure context (HTTPS) for WebRTC to access cameras and microphones. You **must** configure your application to use a secure public domain before you build and run it.

1.  **Update the Frontend (`web/index.html`)**:
    Change the `socket` connection URL to your public domain.

    ```javascript
    // FROM
    const socket = io('[https://privatechat.wtpn.news](https://privatechat.wtpn.news)', {
      path: '/socket.io',
      transports: ['websocket'],
      secure: true
    });

    // TO
    const socket = io('[https://your-public-domain.com](https://your-public-domain.com)', { // <-- Change this
      path: '/socket.io',
      transports: ['websocket'],
      secure: true
    });
    ```

2.  **Update the Server CORS Policy (`server/server.js`)**:
    Update the `cors` origin to allow connections from your public domain.

    ```javascript
    // FROM
    const io = new Server(server, {
      cors: { origin: '[https://privatechat.wtpn.news](https://privatechat.wtpn.news)', methods: ['GET', 'POST'] }
    });

    // TO
    const io = new Server(server, {
      cors: { origin: '[https://your-public-domain.com](https://your-public-domain.com)', methods: ['GET', 'POST'] } // <-- Change this
    });
    ```

### Step 3: Build and Run the Application with Docker

Now that the code is configured with your domain, you can build the Docker images and run the containers.

```bash
docker-compose up --build -d
```

This will start two containers:
* `privatetalk-web`: An Nginx server for the frontend, accessible locally on port `89`.
* `privatetalk-signaling`: The Node.js signaling server.

The application is now running locally, but it is not yet accessible from the internet.

### Step 4: Expose Your App Securely with Cloudflare Tunnel

A Cloudflare Zero Trust Tunnel is a free and secure way to expose your local web server to the internet on your public domain, complete with SSL, without opening any ports on your firewall.

1.  **Install `cloudflared`**: Follow the [official Cloudflare instructions](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/install-and-setup/installation/) to install the `cloudflared` daemon on the machine running Docker.

2.  **Authenticate `cloudflared`**:
    ```bash
    cloudflared tunnel login
    ```
    This will open a browser window for you to log in to your Cloudflare account and authorize the tunnel.

3.  **Create a Tunnel**:
    Give your tunnel a memorable name.
    ```bash
    cloudflared tunnel create privatetalk-tunnel
    ```
    This command will output a tunnel ID and create a credentials file (`.json`) in the `~/.cloudflared/` directory.

4.  **Create a DNS Route**:
    Point your public domain to the tunnel.
    ```bash
    cloudflared tunnel route dns privatetalk-tunnel your-public-domain.com
    ```

5.  **Run the Tunnel**:
    Finally, run the tunnel and point it to your local Nginx service, which is running on port `89`.
    ```bash
    cloudflared tunnel run --url http://localhost:89 privatetalk-tunnel
    ```
    Your application should now be accessible at `https://your-public-domain.com`, fully secured with SSL. The `cloudflared` service will handle the connection between the public internet and your local Docker container.

## License

This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to <https://unlicense.org>



