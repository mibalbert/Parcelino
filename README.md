

 <video loop src="public/assets/readme-video.mp4">  video </video> 


# Parcelino
This is a Node.js application that demonstrates the usage of Google Maps API to display a map with route directions and markers. The application provides an interactive interface to enter origin and destination addresses and generates a route between them.

## Installation and Setup
To set up the project, follow these steps:

1. Clone the repository to your local machine.

```bash
git clone https://github.com/mibalbert/Parcelino.git
```

2. Navigate to the project directory.

```bash
cd Parcelino
```

3. Install the dependencies using npm.

```bash
npm install
```

4. Create a Google Maps API key by following the official documentation.

5. Replace the placeholder API key in the following line of code with your own API key:

The file where this is found is public/js/home.js

```bash
script.src = "https://maps.googleapis.com/maps/api/js?key=**YOUR_API_KEY**&libraries=places,geometry&callback=initMap";
```

## Usage
### Running the Application
To run the application, execute the following command:

```bash
npm start
```

This will start the Node.js server and make the application available at **`http://localhost:8000`**.

## Interacting with the Application

1. Open a web browser and navigate to **`http://localhost:8000`**.

2. The application will load the Google Maps API and display a map with route directions.

3. Click on the menu button to toggle the visibility of the menu.

4. Enter the origin and destination addresses in the respective input fields.

5. As you type, the application will provide autocomplete suggestions based on the input.

6. Select the desired address from the autocomplete suggestions for both origin and destination.

7. The application will update the map and display the route between the two locations, along with markers.

8. You can resize the window to see the responsive behavior of the map.

## Docker Support

This project also provides Docker support for easy deployment and containerization.

### Prerequisites

- Docker: <ins>Install Docker<ins>

Building and Running with Docker

To build and run the application using Docker, follow these steps:

1. Build the Docker image.

```bash
docker build -t project-name .
```

2. Run the Docker container.

```bash
docker run -p 8000:8000 project-name
```

3. Access the application through the browser at http://localhost:8000.

### Docker Compose

Alternatively, you can use Docker Compose to manage the application and its dependencies.

1. Build and start the Docker services.

```bash
docker-compose up -d
```

2. Access the application through the browser at http://localhost:8000.

3. Stop the Docker services when done.

```bash
docker-compose down
```

## Acknowledgements
This project utilizes the following technologies and libraries:

Node.js
Express.js
Google Maps API
Docker


## License
This project is licensed under the <ins>MIT License<ins>.