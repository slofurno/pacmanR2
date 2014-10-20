
function crossProduct(A, B) {

    var temp = [A[1] * B[2] - A[2] * B[1], A[0] * B[2] - A[2] * B[0], A[0] * B[1] - A[1] * B[0]];

    return temp;


}

function normalise(A) {

    var temp = Math.sqrt(A[0] * A[0] + A[1] * A[1] + A[2] * A[2]);

    temp = 1 / temp;

    var g = [A[0] * temp, A[1] * temp, A[2] * temp];

    return g;

}

function loadFile(mesh, filename) {


    //modelSystem.add(mesh, filename);
    var filedata;

    var modelfile = "models/" + filename;

    jQuery.get(modelfile, function (data) {



        mesh.buildmesh(data);
        //mesh.bindbuffers();


    }, 'text');


}


function Mesh() {

    var self = this;

    this.vertices = [];
    this.normals = [];
    this.uvs = [];

    this.transformedvertices;

    this.instances = [];

    this.meshvertbuffer;
    this.normalsbuffer;
    this.uvbuffer;

    this.transformedbuffer;

    this.ready = false;
}

Mesh.prototype.addInstance = function (Model) {

    this.instances.push(Model);

};

Mesh.prototype.buildmesh = function (data) {



    var vertex_pattern = /v( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)/;
    var normal_pattern = /vn( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)/;
    var uv_pattern = /vt( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)/;
    var face_pattern = /f( +(\d+)\/(\d+)\/(\d+))( +(\d+)\/(\d+)\/(\d+))( +(\d+)\/(\d+)\/(\d+))( +(\d+)\/(\d+)\/(\d+))?/;

    var vertices = [];
    var verticesCount = 0;
    var normals = [];
    var uvs = [];
    var smoothnormals = [];

    var tempnorm;

    var numvertex = 0;
    var numnorm = 0;
    var numuv = 0;
    var numface = 0;

    var lines = data.split('\n');

    for (var i = 0; i < lines.length; i++) {

        var line = lines[i];
        line = line.trim();
        var result;

        if (line.length === 0 || line.charAt(0) === '#') {

            continue;
        }
        else if ((result = vertex_pattern.exec(line)) !== null) {
            vertices.push(4 * parseFloat(result[1]), 4 * parseFloat(result[2]) - 2, 4 * parseFloat(result[3]));

        }
        else if ((result = normal_pattern.exec(line)) !== null) {
            normals.push(parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3]));

        }
        else if ((result = uv_pattern.exec(line)) !== null) {

            uvs.push(parseFloat(result[1]), parseFloat(result[2]));

        }
        else if ((result = face_pattern.exec(line)) !== null) {

            if (smoothnormals.length < 2) {
                for (var i = 0; i < vertices.length; i++) {

                    smoothnormals[i] = 0;

                }

            }

            this.vertices.push(vertices[3 * (parseInt(result[2]) - 1)], vertices[3 * (parseInt(result[2]) - 1) + 1], vertices[3 * (parseInt(result[2]) - 1) + 2],

                vertices[3 * (result[6] - 1)], vertices[3 * (result[6] - 1) + 1], vertices[3 * (result[6] - 1) + 2],

                vertices[3 * (result[10] - 1)], vertices[3 * (result[10] - 1) + 1], vertices[3 * (result[10] - 1) + 2]);


            this.uvs.push(uvs[2 * (result[3] - 1)], uvs[2 * (result[3] - 1) + 1],
                uvs[2 * (result[7] - 1)], uvs[2 * (result[7] - 1) + 1],
                uvs[2 * (result[11] - 1)], uvs[2 * (result[11] - 1) + 1]);


            smoothnormals[3 * (parseInt(result[2]) - 1)] += normals[3 * (result[4] - 1)];
            smoothnormals[3 * (parseInt(result[2]) - 1) + 1] += normals[3 * (result[4] - 1) + 1];
            smoothnormals[3 * (parseInt(result[2]) - 1) + 2] += normals[3 * (result[4] - 1) + 2];

            smoothnormals[3 * (result[6] - 1)] += normals[3 * (result[8] - 1)];
            smoothnormals[3 * (result[6] - 1) + 1] += normals[3 * (result[8] - 1) + 1];
            smoothnormals[3 * (result[6] - 1) + 2] += normals[3 * (result[8] - 1) + 2];

            smoothnormals[3 * (result[10] - 1)] += normals[3 * (result[12] - 1)];
            smoothnormals[3 * (result[10] - 1) + 1] += normals[3 * (result[12] - 1) + 1];
            smoothnormals[3 * (result[10] - 1) + 2] += normals[3 * (result[12] - 1) + 2];

            /*

            this.normals.push(normals[3 * (result[4] - 1)], normals[3 * (result[4] - 1) + 1], normals[3 * (result[4] - 1) + 2],
                normals[3 * (result[8] - 1)], normals[3 * (result[8] - 1) + 1], normals[3 * (result[8] - 1) + 2],
                normals[3 * (result[12] - 1)], normals[3 * (result[12] - 1) + 1], normals[3 * (result[12] - 1) + 2]);
                */

            this.normals.push(3 * (parseInt(result[2]) - 1), 3 * (parseInt(result[2]) - 1) + 1, 3 * (parseInt(result[2]) - 1) + 2,
                3 * (result[6] - 1), 3 * (result[6] - 1) + 1, 3 * (result[6] - 1) + 2,
                3 * (result[10] - 1), 3 * (result[10] - 1) + 1, 3 * (result[10] - 1) + 2);





        }

    }

    var tempnormal;

    for (var i = 0; i < smoothnormals.length - 2; i += 3) {

        tempnormal = normalise([smoothnormals[i], smoothnormals[i + 1], smoothnormals[i + 2]]);

        smoothnormals[i] = tempnormal[0];
        smoothnormals[i + 1] = tempnormal[1];
        smoothnormals[i + 2] = tempnormal[2];

        //console.log(this.vertexnormals[i] + "   " + this.vertexnormals[i+1] + "   " + this.vertexnormals[i+2]);
    }

    for (var i = 0; i < this.normals.length; i++) {

        this.normals[i] = smoothnormals[this.normals[i]];

    }

    this.meshvertbuffer = new Float32Array(this.vertices);

    this.transformedvertices = new ArrayBuffer(this.vertices.length*4);

    this.transformedbuffer = new Float32Array(this.transformedvertices);

    this.normalsbuffer = new Float32Array(this.normals);
    //this.uvbuffer = new Float32Array(this.uvs);

    console.log(this);

};