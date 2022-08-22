FROM nginx:1.21.6

ARG NGINX_PORT
ARG API_V1_APP_NAME
ARG API_V1_APP_PORT
ARG API_V2_APP_NAME
ARG API_V2_APP_PORT

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

RUN    sed -i 's/__NginxPort/'"$NGINX_PORT"'/g' /etc/nginx/conf.d/default.conf \
	  && sed -i 's/__ApiV1HostName/'"$API_V1_APP_NAME"'/g' /etc/nginx/conf.d/default.conf \
	  && sed -i 's/__ApiV1HostPort/'"$API_V1_APP_PORT"'/g' /etc/nginx/conf.d/default.conf \
    && sed -i 's/__ApiV2HostName/'"$API_V2_APP_NAME"'/g' /etc/nginx/conf.d/default.conf \
	  && sed -i 's/__ApiV2HostPort/'"$API_V2_APP_PORT"'/g' /etc/nginx/conf.d/default.conf
