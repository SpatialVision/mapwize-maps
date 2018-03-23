FROM nginx:1.13.7-alpine
MAINTAINER Mapwize <support@mapwize.io>

ARG INSTALL_PACKAGES="sudo nodejs git make python g++ git autoconf automake nasm zlib-dev"
ARG ENV="development"
ARG API_KEY="\${API_KEY}"
ARG GOOGLE_API_KEY="\${GOOGLE_API_KEY}"
ARG MAPS_GA="\${MAPS_GA}"
ARG SDK_GA="\${SDK_GA}"
ARG SERVER_URL="\${SERVER_URL}"
ARG BASE_URL="\${BASE_URL}"

COPY docker/default.conf /etc/nginx/conf.d/default.conf
COPY docker/run.sh /root/run.sh
COPY . /root/mapwize-maps

RUN \
    apk --no-cache add $INSTALL_PACKAGES && \
    npm install -g npm@5.4.2 && \
    npm config set user 0 && \
    npm config set unsafe-perm true && \
    echo "{ \"allow_root\": true }" > /root/.bowerrc && \
    cd /root/mapwize-maps && \
    git init && git clean -fdX && npm install --production && \
    rm -rf /usr/share/nginx/html/* && mv app/dist/* /usr/share/nginx/html/ && \
    cd /root/mapwize-maps && npm uninstall * && npm uninstall -g npm && \
    cd / && (rm -rf /root/.* 2>/dev/null || true) && rm -rf /root/mapwize-maps && \
    apk del $INSTALL_PACKAGES

EXPOSE 80

ENTRYPOINT [ "sh" ]
CMD [ "/root/run.sh" ]
