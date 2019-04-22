if ( WEBGL.isWebGLAvailable() === false ) {

    document.body.appendChild( WEBGL.getWebGLErrorMessage() );

}

var container, stats, controls;
var camera, scene, renderer, light, cameraOrthoHelper;
var cube, cube_red;
var arrHightlight = [],objHlight = {};
var flag = false;
var lightLayer = {}, cameraArr = [], patrolArr = [];

//声明raycaster和mouse变量
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

var fov = 175;
var near = 1;
var far = 2000;

// var SCREEN_WIDTH = window.innerWidth;
// var SCREEN_HEIGHT = window.innerHeight;
// var aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
// var frustumSize = 600;

init();
animate();

function init() {
    $('#loading').show();
    container = document.createElement( 'div' );
    document.body.appendChild( container );

    // camera = new THREE.PerspectiveCamera( fov, window.innerWidth / window.innerHeight, near, far );
    
    // camera = new THREE.OrthographicCamera(-1, 1, -1, 1, 1, 2000);

    // camera = new THREE.OrthographicCamera( 0.5 * frustumSize * aspect / - 2, 0.5 * frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 1, 1000 );
    camera = new THREE.OrthographicCamera( -100, 260, 1, -200, 1, 1000 );
    camera.position.set( 0, 1000, 0);
    cameraOrthoHelper = new THREE.CameraHelper( camera );
    


    
    
    console.log('相机',camera);

    controls = new THREE.OrbitControls( camera );
    controls.target.set( 0, 1, 0 );
    // controls.enableZoom = false;
    controls.enableRotate = false;//禁止旋转
    // console.log('鼠标',controls)
    controls.update();

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xeeeeee );

    scene.add(cameraOrthoHelper);

    light = new THREE.HemisphereLight( 0xcccccc, 0x444444 );
    // light.position.set( 0, 1, 0 );
    light.position.set( 10, 1, 100 );
    // console.log('半球光',light)
    scene.add( light );

    light = new THREE.DirectionalLight( 0xffffff);
    // light.position.set( 0, 1, 0 );
    light.position.set( 8, 8, 1 );
    // console.log('定向光',light)
    scene.add( light );
    
    
    // grid
    // var gridHelper = new THREE.GridHelper( 28, 28, 0x303030, 0x303030 );
    // scene.add( gridHelper );

    // stats
    stats = new Stats();
    container.appendChild( stats.dom );

    // model
    var loader = new THREE.FBXLoader();
    loader.load( 'models/fbx/elemap.FBX', function ( object ) {
        console.log('---------object-----',object);
        $('#loading').hide();
        object.scale.y = 0.1;
        var arr = object.children;
        for(var i = 0,len = arr.length; i < len; i ++) {
            if(arr[i].name.indexOf('Highlight') > 0) {
                lightLayer[arr[i].name] = arr[i];
                arr[i].visible = false;
            } else if(arr[i].name.indexOf('摄像头') > 0) {
                arr[i].material.transparent = true;
                cameraArr.push(arr[i]);
            } else if(arr[i].name.indexOf('更') > 0) {
                arr[i].material.transparent = true;
                patrolArr.push(arr[i]);
            }
        }
        object.traverse( function ( child ) {
            if ( child.isMesh ) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        } );

        scene.add( object );

    } );

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

//

function animate() {

    requestAnimationFrame( animate );

    render();

    stats.update();

}

function render() {

    renderer.render( scene, camera );

}

// 放大，缩小
// $('canvas').on('mousewheel',mousewheel);
//鼠标滑轮
function mousewheel(e) {
    console.log('滚动了')
    if (e.originalEvent.wheelDelta) { //判断浏览器IE，谷歌滑轮事件
        if (e.originalEvent.wheelDelta > 0) { //当滑轮向上滚动时
            fov -= (near < fov ? 1 : 0);
        }

        if (e.originalEvent.wheelDelta < 0) { //当滑轮向下滚动时
            fov += (fov < far ? 1 : 0);
        }

    } else if (e.originalEvent.detail) { //Firefox滑轮事件
        if (e.originalEvent.detail > 0) { //当滑轮向上滚动时
            fov -= 1;
        }

        if (e.originalEvent.detail < 0) { //当滑轮向下滚动时
            fov += 1;
        }

    }
    if(fov > 175 || fov < 150) {
        fov = fov > 175 ? 175 : 150;
        return
    }
    // console.log('fov',fov)
    camera.fov = fov;
    camera.updateProjectionMatrix();
    render();
}
// 点击事件
function onMouseClick( event ) {
    $('#menuRight').hide();
    //通过鼠标点击的位置计算出raycaster所需要的点的位置，以屏幕中心为原点，值的范围为-1到1.

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    // 通过鼠标点的位置和当前相机的矩阵计算出raycaster
    raycaster.setFromCamera( mouse, camera );

    
    // 获取raycaster直线和所有模型相交的数组集合
    let obj = {}, arr = [];
    let mesh = [];
    for(let i = 0; i < scene.children.length; i ++) {
        if(scene.children[i].type == 'Group') {
            obj = scene.children[i];
        }
        if(scene.children[i].type == 'Mesh') {
            mesh.push(scene.children[i]);
        }
    }
    arr = obj.children;
    for(let i = 0; i < arr.length; i ++) {
        if(arr[i].type == 'Mesh') {
            mesh.push(arr[i]);
        }
    }
    var intersects = raycaster.intersectObjects( mesh );
    
    console.log(intersects);
    
    
    //将所有的相交的模型的颜色设置为红色，如果只需要将第一个触发事件，那就数组的第一个模型改变颜色即可
    if(intersects.length > 0) {
        var selectedObject = intersects[0].object;
        console.log('选中的对象',selectedObject)
        let name = selectedObject.name + '_Highlight_';
        for(let key in lightLayer) {
            if(key == name) {
                lightLayer[key].visible = true;
            } else {
                lightLayer[key].visible = false;
            }
        }
        showFloor(selectedObject.name);
        if(selectedObject.name == '巡更_在线013') {
            flag = true;
            mousedown();
            let html = `<li>红色选项01</li><li>红色选项02</li><li>红色选项03</li>`;
            $('#menuRight').html(html);
        } else {
            flag = false;
        }
        // intersects[ 0 ].object.material.color.set( 0x12e4ef);
    }
    
    

}
$('canvas').on('click',onMouseClick);

// 显示楼层
function showFloor(name) {
    n = 1;
    $('#floor').show();
    $('.floor_box>ul').css('top',0);
    $('.floor_pre').hide();
    if(name == 'D031' || name == 'D032') {
        floor(6,name)
    } else if(name == 'D03') {
        floor(5,name)
    } else if(name == 'D040') {
        floor(8,name)
    } else {
        $('#floor').hide();
    }
}
// 楼层
function floor(num,name) {
    let html = '';
    if(num > 5) {
        $('.floor_next').show(); 
    } else {
        $('.floor_next').hide(); 
    }
    for(let i = 1; i <= num; i ++) {
        let floor = name + '_' + i + 'F';
        html += '<li data-floor=' + floor + '>' + i + 'F</li>';
    }
    $('.floor_box ul').html(html);
}

// 显示楼层详情
$('.floor_box>ul').on('click','li',function() {
    let floor = $(this).attr('data-floor');
    $(this).addClass('current').siblings().removeClass('current');
    $('#mask').show();
    $('#layerImage').show();
    $('#layerImage img').attr('src','./images/' + floor + '.png');
})
$('#mask').on('click',function() {
    $(this).hide();
    $('#layerImage').hide();
})


// 右键菜单
function mousedown() {
    $('canvas').on('mousedown',function(e) {
        if(!flag) return
        if(e.which == 3) {
            $('#menuRight').show();
            //获取我们自定义的右键菜单
            var menu=document.querySelector("#menuRight");

            //根据事件对象中鼠标点击的位置，进行定位
            menu.style.left=e.clientX+'px';
            menu.style.top=e.clientY+'px';
        }
    }) 
}
// 右键菜单点击事件
$('#menuRight').on('click','li',function() {
    console.log($(this).text());
})
$('canvas').siblings()[0].style.display = 'none';

// 左侧菜单点击事件
$('#menuLeft>li').on('click',function() {
    var type = $(this).attr('data-type');
    $('#cameraList li').removeClass('currentList');
    $(this).addClass('current').siblings().removeClass('current');
    hide();
    if(type == '1') {//电子围栏
        
    } else if(type == '2') {//红外幕帘
        
    } else if(type == '3') {//巡更报警
        
    } else if(type == '4') {//巡更点位
        patrolArr.forEach(item => {
            if(item.name.slice(0,2) == '巡更') {
                item.visible = true;
            }
        })
    } else if(type == '5') {//门禁访客

    } else if(type == '6') {//摄像机
        cameraArr.forEach(item => {
            item.visible = true;
        })
    }
      
})

// 显示摄像头类别
var isUp = true;
$('.camera>div').on('click',function() {
    $(this).css('color','#585755');
    if(isUp) {
        $('#cameraList').show();
        $('#sanjiao').attr('src','images/up.png');
        isUp = false;
    } else {
        $('#cameraList').hide();
        $('#sanjiao').attr('src','images/down.png');
        isUp = true;
    }
})

// 点击摄像机列表
$('#cameraList li').on('click',function(e) {
    e.stopPropagation();
    $(this).addClass('currentList').siblings().removeClass('currentList');
    var type = $(this).attr('data-type');
    hide();
    if(type == '6_1') {//枪状机
        cameraArr.forEach(item => {
            if(item.name.slice(0,2) == '枪式') {
                item.visible = true;
            }
        })
    } else if(type == '6_2') {//球状机
        cameraArr.forEach(item => {
            if(item.name.slice(0,2) == '球形') {
                item.visible = true;
            }
        })
    } else if(type == '6_3') {//安全枪状机
        cameraArr.forEach(item => {
            if(item.name.indexOf('全枪') > 0) {
                item.visible = true;
            }
        })
    } else if(type == '6_4') {//安全球状机
        cameraArr.forEach(item => {
            if(item.name.indexOf('全球') > 0) {
                item.visible = true;
            }
        })
    }
})

// 隐藏摄像机 巡更
function hide() {
    cameraArr.forEach(item => {
        item.visible = false;
    })
    patrolArr.forEach(item => {
        item.visible = false;
    })
}


// 显示下一楼
var n = 1;
$('.floor_next').on('click',function() {
    let li_len = $('.floor_box>ul li').length;
    let m = li_len - 5;
    if(n == m) $('.floor_next').hide();
    let num = n*(-51) + 'px';
    $('.floor_pre').show();
    
    $('.floor_box>ul').css('top',num);
    n ++;
})
$('.floor_pre').on('click',function() {
    n --;
    if(n == 1) {
        $(this).hide();
        $('.floor_next').show();
    }
    let num = n*(-51) + 51 + 'px';
    $('.floor_box>ul').css('top',num);
})