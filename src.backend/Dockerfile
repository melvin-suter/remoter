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
FROM node:18-alpine
COPY --from=build /usr/local/app/dist /usr/local/app

# Expose port 80
EXPOSE 5000

WORKDIR /usr/local/app
# When the container starts, replace the env.js with values from environment variables
CMD ["/bin/sh",  "-c",  "node index.js"]