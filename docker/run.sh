#/usr/bin/env sh

appjs=$(ls /usr/share/nginx/html/assets/js | grep app);
envsubst \${API_KEY},\${GOOGLE_API_KEY},\${SERVER_URL},\${MAPS_GA},\${SDK_GA},\${BASE_URL} \
    < "/usr/share/nginx/html/assets/js/$appjs" \
    > "/usr/share/nginx/html/assets/js/app.min.js"
rm "/usr/share/nginx/html/assets/js/$appjs"
mv "/usr/share/nginx/html/assets/js/app.min.js" "/usr/share/nginx/html/assets/js/$appjs"

envsubst \${BASE_URL} \
    < "/usr/share/nginx/html/404.html" \
    > "/usr/share/nginx/html/404-to-use.html"
rm "/usr/share/nginx/html/404.html"
mv "/usr/share/nginx/html/404-to-use.html" "/usr/share/nginx/html/404.html"

envsubst \${BASE_URL} \
    < "/usr/share/nginx/html/500.html" \
    > "/usr/share/nginx/html/500-to-use.html"
rm "/usr/share/nginx/html/500.html"
mv "/usr/share/nginx/html/500-to-use.html" "/usr/share/nginx/html/500.html"

/usr/sbin/nginx  -g "daemon off;"
