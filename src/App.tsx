import Scatterplot from './components/Scatterplot';

const exampleData = [
  {
    bla: 1,
    blub: 2,
  },
  {
    bla: 3,
    blub: 4,
  },
  { bla: 0, blub: 0 },
];

function App() {
  return (
    <div>
      <h1>Hello from React</h1>
      <Scatterplot data={exampleData} xFeature="bla" yFeature="blub" />
    </div>
  );
}

export default App;
