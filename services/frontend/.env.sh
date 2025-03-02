#!/bin/sh

# This script generates the runtime config.js with environment variables
# It allows us to inject configuration at runtime, not build time

# Recreate config file
rm -rf /usr/share/nginx/html/config.js
touch /usr/share/nginx/html/config.js

# Add assignment 
echo "window.ENV = {" >> /usr/share/nginx/html/config.js

# Add env vars with "REACT_APP_" prefix
for key in $(env | grep -E "^REACT_APP_" | cut -d= -f1); do
    # Get value and escape quotes
    value=$(printenv $key | sed 's/"/\\"/g')
    echo "  $key: \"$value\"," >> /usr/share/nginx/html/config.js
done

# Close the object
echo "};" >> /usr/share/nginx/html/config.js

# Run nginx
exec "$@"


