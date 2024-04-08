#!/bin/bash

# Function to extract error IDs and references from JavaScript files
extract_error_ids() {
    local file="$1"
    local filename=$(basename "$file")
    local line_number=0

    while IFS= read -r line; do
        ((line_number++))
        # Match the pattern for error reference
        if [[ $line =~ ErrorSerializer.*?\"id\"\s*:\s*([^,]+).*?\"code\"\s*:\s*([^,]+).*?\"message\"\s*:\s* ]]; then
            id="${BASH_REMATCH[1]}"
            code="${BASH_REMATCH[2]}"
            message="${BASH_REMATCH[3]}"
            # Output in plain text format
            # echo "File: $filename, Line: $line_number, ID: $id, Code: $code, Message: $message"
            # Output in JSON format
            echo "{ \"file\": \"$filename\", \"line\": $line_number, \"id\": $id, \"code\": $code, \"message\": \"$message\" },"
        fi
    done < "$file"
}

# Main function to iterate through JavaScript files in the project directory
main() {
    local project_dir="$1"
    # Check if directory exists
    if [ ! -d "$project_dir" ]; then
        echo "Directory $project_dir not found."
        exit 1
    fi

    echo "["
    # Iterate through JavaScript files, excluding "node_modules" folder
    find "$project_dir" -type d -name "node_modules" -prune -o -type f -name "*.js" -print | while read -r file; do
        extract_error_ids "$file"
    done
    echo "]"
}

# Check if project directory argument is provided
if [ $# -ne 1 ]; then
    echo "Usage: $0 <project_directory>"
    exit 1
fi

main "$1"
