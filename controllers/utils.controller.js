const shell = require('shelljs');

class utilsController {

    async rebootSystem(req, res) {
        try {

            if (shell.exec('pm2 restart tiontele').code !== 0) {
                shell.echo('Error: Git commit failed');
                shell.exit(1);
            }

            return res.status(200).json({ message: "Success" })


        } catch (e) {
            console.log(e)
            return res.status(400).json({ message: "Get Agregators error!" })
        }
    }

}

module.exports = new utilsController()

