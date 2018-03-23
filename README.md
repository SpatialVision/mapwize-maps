# Mapwize Web App

We are providing a standard web application to view indoor maps, search for places and get directions.

The application is available at [maps.mapwize.io](https://maps.mapwize.io).

!!! note "Code is open source"
    The entire source code of the Mapwize Maps web application is available on [Github](https://github.com/Mapwize/mapwize-maps). You are free to use it to build your own app. See the instructions below.

## Features

- Browse venue maps. Simply zoom in to enter a venue. Change floor using the floor selector on the bottom right.
- Search. Search for venues when you are viewing the world map, and search for places when you are inside a venue.
- Get directions. Use the direction button to compute directions from one point to another. If your precise indoor location is known (see below), it can be used as starting point.

## Private maps

By default, only public buildings are visible on the map. To view private buildings, a custom API key or an access key is required. 

Access keys can be entered using the top left menu, or with an url parameter. 

The use of access key requires the app to use cookie sessions. To avoid the need for cookies, and therefore simplify the deployment accross browsers, the use of the custom API keys is prefered. Please note that custom API keys can only be provided through URL parameters.


## Indoor Location

The location of the user can come from 3 different sources:

- The approximate location provided by the browser. This is often based on the GPS on mobile devices and on IP location on desktop. This location is not suitable to be used for computing directions.
- If the app is opened from scanning a QR-Code, the location of the QR-Code is used to set the user location.
- The location can also be retrieved from a socket emitter server using the [Indoor Location framework](http://www.indoorlocation.io). The socket server url and the userId need to be provided as url parameter.

## iFrame embed

maps.mapwize.io is made to be used in an iFrame or in a webview on any website or mobile application. The Mapwize url format allows the map to be loaded according to your needs.

Unfortunately, it is not possible to catch map events on your website or in your app if you use an iFrame embed. For deeper integration, use the JS, iOS or Android SDKs.

## URL parameters

- `venueId` the identifier of a Mapwize venue to restrict the map to only showing that venue
```
https://maps.mapwize.io/#/?venueId=56c2ea3402275a0b00fb00ac // Demo
```

- `organizationId` the identifier or a Mapwize organization to restrict the map to only showing venues of that organization
```
https://maps.mapwize.io/#/?organizationId=55acc650e967a7e30c523214 // Mapwize
```

- `menu` true/false. Set to false to prevent the Mapwize side menu from opening.
```
https://maps.mapwize.io/#/?menu=false
```

- `mainColor` an hexadecimal color code **without** # (like: ?mainColor=9a8b2c) to specify the color of the interface.
```
https://maps.mapwize.io/#/?mainColor=9a8b2c
```

- `iconUrl` the full **encoded** url to a 40px x 80px png image to be used as marker for place selection and direction destination.
```
https://maps.mapwize.io/#/?iconUrl=https:%2F%2Fimage.ibb.co%2FiSUm5G%2Fpointer_cyp_copie.png
```

- `apiKey` the Mapwize API key to use. This is the ideal option to access private buildings as it does not require the use of session cookies. 
```
https://maps.mapwize.io/#/?apiKey=YOURAPIKEY
```

- `indoorLocationSocketUrl` the url to the emitter server. URL must be escaped. The server must comply with the the Indoor Location Socket Emitter specifications. 
- `indoorLocationUserId` the user identifyer to use to retrieve the location from the server.
```
https://maps.mapwize.io/#/? indoorLocationSocketUrl=myserver.mydomain.com& indoorLocationUserId=192.168.1.2
```

Parameters can be combined using `&`
```
https://maps.mapwize.io/#/?organizationId=55acc650e967a7e30c523214&menu=false&mainColor=9a8b2c
```

## Developers

Run the app from the source code and modify it to your needs.

### Requirements

To run the app, the following tools need to be installed:

* Node.js - [Download & Install Node.js](http://www.nodejs.org/download/) and the npm package manager.

* Grunt - [Grunt Task Runner](http://gruntjs.com/) to automate development process. To install:

```
$ sudo npm install -g grunt-cli
```

* Bower - To manage front-end dependencies. To install:

```
$ sudo npm install -g bower
```

### Installing dependencies

```sh
$ npm install
$ bower install
```

### Set your configurations

You need to set your Mapwize API key in `app/config/default.json`. You can get your API key by signing up at [mapwize.io](https://www.mapwize.io).

If you want to search for addresses or collect analytics, you also need to add your keys there.

You can define multiple environment with multiple config files. The default is `local`. To change environment, set the `ENV` environment variable at start up like

```
$ ENV=production grunt
```

### Running the app in dev mode

This runs the app using directly the source files. It's the fastest to dev and debug.

```sh
$ grunt
```

This will start a local webserver on port 3001. Then open the following url in your browser:

[http://localhost:3001](http://localhost:3001)



### Compiling the app

To compile the app and make it ready for production:

```sh
$ grunt dist
```

### Running the compiled app

Run

```sh
$ grunt dist
$ grunt
```

Then open

[http://localhost:3001/dist](http://localhost:3001/dist)


