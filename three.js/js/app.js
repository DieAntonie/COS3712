/**
 * @author mrdoob / http://mrdoob.com/
 */

var APP = {

	Player: function () {

		var loader = new THREE.ObjectLoader();
		var camera, scene, renderer;
		var water, light;

		var events = {};

		var dom = document.createElement( 'div' );
		this.dom = dom;

		this.width = 500;
		this.height = 500;
		this.rotation = {
			speed: 0.001,
			active: false,
			direction: true
		};

		this.rotation_button = document.getElementById("RotationStartStop");
		this.rotation_button.onclick = () => this.rotation.active = !(this.rotation.active);

		this.direction_button = document.getElementById("RotationRedirect");
		this.direction_button.onclick = () => this.rotation.direction = !(this.rotation.direction);

		this.speed_slider = document.getElementById("rotationSpeed");
		this.speed_slider.onchange = (event) => this.rotation.speed = (event.target.valueAsNumber * 0.0002);

		this.speed_slider.value = 50;

		this.zoom_slider = document.getElementById("zoomDepth");
		this.zoom_slider.onchange = (event) => {
			console.log(scene);
			camera.rotation.x = (event.target.valueAsNumber * -0.004);
			camera.position.z = (0.5 + event.target.valueAsNumber * 0.2);
			camera.position.y = (0.5 + (event.target.valueAsNumber * 0.1));
		};

		this.zoom_slider.value = 50;

		this.load = function ( json ) {

			renderer = new THREE.WebGLRenderer( { antialias: true } );
			renderer.gammaOutput = true;
			renderer.setClearColor( 0x000000 );
			renderer.setPixelRatio( window.devicePixelRatio );

			var project = json.project;

			if ( project.shadows ) renderer.shadowMap.enabled = true;
			if ( project.vr ) renderer.vr.enabled = true;

			dom.appendChild( renderer.domElement );

			this.setScene( loader.parse( json.scene ) );
			this.setCamera( loader.parse( json.camera ) );

			events = {
				init: [],
				start: [],
				stop: [],
				keydown: [],
				keyup: [],
				mousedown: [],
				mouseup: [],
				mousemove: [],
				touchstart: [],
				touchend: [],
				touchmove: [],
				update: []
			};

			var scriptWrapParams = 'player,renderer,scene,camera';
			var scriptWrapResultObj = {};

			for ( var eventKey in events ) {

				scriptWrapParams += ',' + eventKey;
				scriptWrapResultObj[ eventKey ] = eventKey;

			}

			var scriptWrapResult = JSON.stringify( scriptWrapResultObj ).replace( /\"/g, '' );

			for ( var uuid in json.scripts ) {

				var object = scene.getObjectByProperty( 'uuid', uuid, true );

				if ( object === undefined ) {

					console.warn( 'APP.Player: Script without object.', uuid );
					continue;

				}

				var scripts = json.scripts[ uuid ];

				for ( var i = 0; i < scripts.length; i ++ ) {

					var script = scripts[ i ];

					var functions = ( new Function( scriptWrapParams, script.source + '\nreturn ' + scriptWrapResult + ';' ).bind( object ) )( this, renderer, scene, camera );

					for ( var name in functions ) {

						if ( functions[ name ] === undefined ) continue;

						if ( events[ name ] === undefined ) {

							console.warn( 'APP.Player: Event type not supported (', name, ')' );
							continue;

						}

						events[ name ].push( functions[ name ].bind( object ) );

					}

				}

			}
			
			light = new THREE.Vector3(0,1,0); //new THREE.DirectionalLight( 0xffffff, 0.8 );
			//  scene.add( light );

			// Water

			var waterGeometry = new THREE.PlaneBufferGeometry( 1000, 1000 );

			water = new THREE.Water(
				waterGeometry,
				{
					textureWidth: 512,
					textureHeight: 512,
					waterNormals: new THREE.TextureLoader().load( 'waternormals.jpg', function ( texture ) {

						texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

					} ),
					alpha: 1.0,
					sunDirection: light,//light.position.clone().normalize(),
					sunColor: 0xffffff,
					waterColor: 0x001e0f,
					distortionScale: 3.7,
					fog: scene.fog !== undefined
				}
			);

			water.rotation.z = - Math.PI / 2;

			water.rotation.x = - Math.PI / 2;

			scene.add( water );

			// Skybox

			var sky = new THREE.Sky();
			sky.scale.setScalar( 10000 );
			scene.add( sky );

			var uniforms = sky.material.uniforms;

			uniforms[ "turbidity" ].value = 10;
			uniforms[ "rayleigh" ].value = 2;
			uniforms[ "luminance" ].value = 1;
			uniforms[ "mieCoefficient" ].value = 0.005;
			uniforms[ "mieDirectionalG" ].value = 0.8;

			var parameters = {
				distance: 400,
				inclination: 0,
				azimuth: 0.205
			};

			function updateSun() {

				// var theta = Math.PI * ( parameters.inclination - 0.5 );
				// var phi = 2 * Math.PI * ( parameters.azimuth - 0.5 );

				// light.position.x = parameters.distance * Math.cos( phi );
				// light.position.y = parameters.distance * Math.sin( phi ) * Math.sin( theta );
				// light.position.z = parameters.distance * Math.sin( phi ) * Math.cos( theta );

				sky.material.uniforms[ "sunPosition" ].value = light // .position.copy( light.position );
				water.material.uniforms[ "sunDirection" ].value.copy( light /*.position*/ ).normalize();
			}

			updateSun();

			dispatch( events.init, arguments );

		};

		this.setCamera = function ( value ) {

			camera = value;
			camera.aspect = this.width / this.height;
			camera.updateProjectionMatrix();

			if ( renderer.vr.enabled ) {

				dom.appendChild( WEBVR.createButton( renderer ) );

			}

		};

		this.setScene = function ( value ) {

			scene = value;

		};

		this.setSize = function ( width, height ) {

			this.width = width;
			this.height = height;

			if ( camera ) {

				camera.aspect = this.width / this.height;
				camera.updateProjectionMatrix();

			}

			if ( renderer ) {

				renderer.setSize( width, height );

			}

		};

		function dispatch( array, event ) {

			for ( var i = 0, l = array.length; i < l; i ++ ) {

				array[ i ]( event );

			}

		}

		var time, prevTime;

		function animate() {

			time = performance.now();

			try {

				dispatch( events.update, { time: time, delta: time - prevTime } );
				water.material.uniforms[ "time" ].value += 0.075 / 60.0;

			} catch ( e ) {

				console.error( ( e.message || e ), ( e.stack || "" ) );

			}

			renderer.render( scene, camera );

			prevTime = time;

		}

		this.play = function () {

			prevTime = performance.now();

			document.addEventListener( 'keydown', onDocumentKeyDown );
			document.addEventListener( 'keyup', onDocumentKeyUp );
			document.addEventListener( 'mousedown', onDocumentMouseDown );
			document.addEventListener( 'mouseup', onDocumentMouseUp );
			document.addEventListener( 'mousemove', onDocumentMouseMove );
			document.addEventListener( 'touchstart', onDocumentTouchStart );
			document.addEventListener( 'touchend', onDocumentTouchEnd );
			document.addEventListener( 'touchmove', onDocumentTouchMove );

			dispatch( events.start, arguments );
			renderer.setAnimationLoop( animate );

		};

		this.stop = function () {

			document.removeEventListener( 'keydown', onDocumentKeyDown );
			document.removeEventListener( 'keyup', onDocumentKeyUp );
			document.removeEventListener( 'mousedown', onDocumentMouseDown );
			document.removeEventListener( 'mouseup', onDocumentMouseUp );
			document.removeEventListener( 'mousemove', onDocumentMouseMove );
			document.removeEventListener( 'touchstart', onDocumentTouchStart );
			document.removeEventListener( 'touchend', onDocumentTouchEnd );
			document.removeEventListener( 'touchmove', onDocumentTouchMove );

			dispatch( events.stop, arguments );

			renderer.setAnimationLoop( null );

		};

		this.dispose = function () {

			while ( dom.children.length ) {

				dom.removeChild( dom.firstChild );

			}

			renderer.dispose();

			camera = undefined;
			scene = undefined;
			renderer = undefined;

		};

		//

		function onDocumentKeyDown( event ) {

			dispatch( events.keydown, event );

		}

		function onDocumentKeyUp( event ) {

			dispatch( events.keyup, event );

		}

		function onDocumentMouseDown( event ) {

			dispatch( events.mousedown, event );

		}

		function onDocumentMouseUp( event ) {

			dispatch( events.mouseup, event );

		}

		function onDocumentMouseMove( event ) {

			dispatch( events.mousemove, event );

		}

		function onDocumentTouchStart( event ) {

			dispatch( events.touchstart, event );

		}

		function onDocumentTouchEnd( event ) {

			dispatch( events.touchend, event );

		}

		function onDocumentTouchMove( event ) {

			dispatch( events.touchmove, event );

		}

	}

};
