import React, {useEffect, useState} from 'react';
import tips from './tips';
import {sortAs} from '../src/Utilities';
import PivotTableUI from '../src/PivotTableUI';
import '../src/pivottable.css';
import Papa from 'papaparse';
import {data, responses} from './data';
import {configTableData} from './config';

function PivotTableUISmartWrapper() {
  const [tableData, setTableData] = useState(data);
  const [userResponses] = useState(responses);

  const [questionTitles, setQuestionTitles] = useState([]);

  useEffect(() => {
    const titles = data.map(record => Object.keys(record)[0]);
    setQuestionTitles(titles);
  }, []);

  return (
    <PivotTableUI
      data={tableData}
      stubs={questionTitles}
      userResponses={userResponses}
      onChange={s => setTableData(s)}
      {...tableData}
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
