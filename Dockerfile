From nginx:latest

WORKDIR /usr/share/nginx/html

COPY fonts fonts
COPY favicon.ico favicon.ico
COPY site.webmanifest site.webmanifest
COPY index.html index.html
COPY index.js index.js
COPY output.css output.css