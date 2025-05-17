import './App.css';

function App() {

    const getData = async (event) => {
        console.log("test")
        event.preventDefault();
        try {
            console.log("test2")
            const response = await fetch('http://localhost:3001/getRainDataFromDB');
            const data = await response.json();
            //setRainData(data.rainData);
            console.log("Rain Data:", data.rainData);
        } catch (error) {
            console.error("Fehler beim Abrufen der Daten:", error);
        }
    };

    return (
        <div className="App">
            <header className="App-header">
                <form onSubmit={getData}>
                    <button type="submit">Daten Laden</button>
                </form>
            </header>
        </div>
    );
}


export default App;
