module.exports = function(Apio){

	return {
        addNotification : function(req, res){
            var data = typeof req.body.data === "string"  ? JSON.parse(req.body.data) : req.body.data;
            var update = {};

            for(var i in data.properties){
                for(var j in data.properties[i]){
                    update["notifications."+i+"."+j] = data.properties[i][j];
                }
            }

            Apio.Database.db.collection("Objects").update({objectId : data.objectId}, {$set : update}, function(error, result){
                if(error){
                    console.log("Unable to update object with objectId "+data.objectId, error);
                    res.status(500).send();
                } else if(result){
                    console.log("Added notification ", update, " on object with objectId "+data.objectId);
                    res.status(200).send();
                }
            });
        },
        create: function(req, res) {

        },
        delete: function(req, res) {

        },
        update: function(req, res) {
            var object = typeof req.body.object === "string"  ? JSON.parse(req.body.object) : req.body.object;

            Apio.Logger.log({
                source : 'ApioOS',
                event : 'update',
                value : object
            });
            Apio.Remote.socket.emit('apio.server.object.update', object);
            if (object.writeToDatabase === true){
                Apio.Database.updateProperty(object, function() {
                    //Connected clients are notified of the change in the database
                    Apio.io.emit("apio_server_update", object);

                });
            } else {
                Apio.Util.debug("Skipping write to Database");
            }


            //Invio i dati alla seriale se richiesto
            if (object.writeToSerial === true && ENVIRONMENT == 'production') {
                Apio.Serial.send(object);
            } else {
                Apio.Util.debug("Skipping Apio.Serial.send");
            }

            res.status(200).send();
        },
        getById: function(req, res) {
            Apio.Database.getObjectById(req.params.id, function(result) {
                res.send(result);
            })
        },
        list: function(req, res) {
						//console.log("Richiesta")
            Apio.Object.list(function(err,data){
                if (err)
                    res.status(500).send(err);
                else
                    res.send(data);
            })
        }
    }
    }
