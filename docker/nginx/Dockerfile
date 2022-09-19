FROM nginx:1.21.6

ARG NGINX_PORT
ARG APP_HOST_NAME
ARG APP_PORT

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

RUN    sed -i 's/__NginxPort/'"$NGINX_PORT"'/g' /etc/nginx/conf.d/default.conf \
	  && sed -i 's/__AppHostName/'"$APP_HOST_NAME"'/g' /etc/nginx/conf.d/default.conf \
	  && sed -i 's/__AppPort/'"$APP_PORT"'/g' /etc/nginx/conf.d/default.conf
