import React, {useEffect, useState} from 'react';
import tips from './tips';
import {sortAs} from '../src/Utilities';
import TableRenderers from '../src/TableRenderers';
import createPlotlyComponent from 'react-plotly.js/factory';
import createPlotlyRenderers from '../src/PlotlyRenderers';
import PivotTableUI from '../src/PivotTableUI';
import '../src/pivottable.css';
import Dropzone from 'react-dropzone';
import Papa from 'papaparse';
import {data} from './data';

const Plot = createPlotlyComponent(window.Plotly);

function PivotTableUISmartWrapper() {
  const [tableData, setTableData] = useState([]);
  const [tableDataB, setTableDataB] = useState(data);
  const [filteredData, setFilteredData] = useState(data);

  const [questionTitles, setQuestionTitles] = useState([]);

  useEffect(() => {
    const titles = data.map(record => Object.keys(record)[0]);
    setQuestionTitles(titles);
  }, []);

  useEffect(() => {
    console.log(tableDataB);
  }, [tableDataB]);

  return (
    <PivotTableUI
      dataB={tableDataB}
      // cols={questionTitles}
      rows={questionTitles}
      onChange={s => setTableDataB(s)}
      {...tableDataB}
    />
  );
}

export default class App extends React.Component {
  componentWillMount() {
    this.setState({
      mode: 'demo',
      filename: 'Sample Dataset: Tips',
      pivotState: {
        data: tips,
        aggregatorName: 'Sum over Sum',
        vals: ['Tip', 'Total Bill'],
        rendererName: 'Grouped Column Chart',
        sorters: {
          Meal: sortAs(['Lunch', 'Dinner']),
          'Day of Week': sortAs(['Thursday', 'Friday', 'Saturday', 'Sunday']),
        },
        plotlyOptions: {width: 900, height: 500},
        plotlyConfig: {},
        tableOptions: {
          clickCallback: function(e, value, filters, pivotData) {
            var names = [];
            pivotData.forEachMatchingRecord(filters, function(record) {
              names.push(record.Meal);
            });
            alert(names.join('\n'));
          },
        },
      },
    });
  }

  onDrop(files) {
    this.setState(
      {
        mode: 'thinking',
        filename: '(Parsing CSV...)',
        textarea: '',
        pivotState: {data: []},
      },
      () =>
        Papa.parse(files[0], {
          skipEmptyLines: true,
          error: e => alert(e),
          complete: parsed =>
            this.setState({
              mode: 'file',
              filename: files[0].name,
              pivotState: {data: parsed.data},
            }),
        })
    );
  }

  onType(event) {
    Papa.parse(event.target.value, {
      skipEmptyLines: true,
      error: e => alert(e),
      complete: parsed =>
        this.setState({
          mode: 'text',
          filename: 'Data from <textarea>',
          textarea: event.target.value,
          pivotState: {data: parsed.data},
        }),
    });
  }

  render() {
    return (
      <div>
        <div className="row">
          <h2 className="text-center">{this.state.filename}</h2>
          <br />

          <PivotTableUISmartWrapper {...this.state.pivotState} />
        </div>
      </div>
    );
  }
}
