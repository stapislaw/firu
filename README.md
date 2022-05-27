# firu - simple framework for Electron and React

firu is a simple library which allows you to:
- create Electron's BrowserWindow with only script file instead of html file.
- simply sending data from main process to renderer process.
- calling functions in main process from renderer process.
- functions that simplify using firu with React

## Sample use

### Creating window
    const path = "./path/to/script"; 
    const options = {};
    const win = new FiruWindow(path, options);

### Creating window with data
    const path = "./path/to/script"; 
    const options = {
        data: {
            msg: "Lorem ipsum",
            foo: () => console.log("foo")
        }
    };
    const win = new FiruWindow(path, options);

### Using data and function in renderer process
    firu.whenReady().then(() => {
        console.log("msg:", firu.data["msg"]);
        firu.data["foo"]();
    });

### Simple rendering of React content
    firu.render(<Bar></Bar>);