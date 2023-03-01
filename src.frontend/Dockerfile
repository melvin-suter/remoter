# Dockerfile to build and server the Angular application


###############
### STAGE 1: Build app
###############
FROM node:18-alpine as build

WORKDIR /usr/local/app
# Add the source code to app
COPY ./ /usr/local/app/
# Install all the dependencies
RUN npm install --include=dev
# Generate the build of the application
RUN npm run build

###############
### STAGE 2: Serve app with nginx ###
###############
FROM nginx:1.23.3-alpine
COPY --from=build /usr/local/app/dist/remoteng /usr/share/nginx/html
COPY entrypoint.sh /entrypoint.sh
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN chmod +x /entrypoint.sh

# Expose port 80
EXPOSE 80

# When the container starts, replace the env.js with values from environment variables
ENTRYPOINT /entrypoint.sh