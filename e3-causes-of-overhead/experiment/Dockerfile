# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

RUN pip install --upgrade pip
COPY requirements.txt ./

# Install any needed packages specified in requirements.txt (uncomment if you have a requirements.txt)
RUN pip install --no-cache-dir -r requirements.txt

# Copy the current directory contents into the container at /usr/src/app
COPY dynamic_html dynamic_html
COPY graph_pagerank graph_pagerank
COPY *.py .

RUN mkdir output

# Run the main.py script
CMD ["python", "main.py"]
#ENTRYPOINT ["tail", "-f", "/dev/null"]
