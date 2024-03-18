const fs = require('fs');

// Read the JSON file
fs.readFile('heartrate.json', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }

  try {
    const jsonData = JSON.parse(data);
    console.log('Data loaded.');

    const measurements = [];
    for (const entry of jsonData) {
      const { beatsPerMinute, timestamps } = entry;
      const timestamp = timestamps.startTime; // Assuming startTime represents the timestamp
      measurements.push({ beatsPerMinute, timestamp });
    }

    const groupedMeasurements = groupMeasurementsByDay(measurements);

    const results = [];

    // Calculate stats for each day
    for (const [day, measurements] of Object.entries(groupedMeasurements)) {
      const { minBPM, maxBPM, medianBPM, latestTimestamp } = calculateStats(measurements);
      
      // Store the results
      results.push({
        day,
        minBPM,
        maxBPM,
        medianBPM,
        latestTimestamp
      });
    }

    // Write results to a JSON file
    fs.writeFile('output.json', JSON.stringify(results, null, 2), 'utf8', err => {
      if (err) {
        console.error('Error saving results:', err);
        return;
      }
      console.log('Results saved to output.json');
    });

  } catch (parseError) {
    console.error('Error parsing JSON:', parseError);
  }
});

// Function to calculate minimum, maximum, and median BPM for a given array of measurements
function calculateStats(measurements) {
  const bpmValues = measurements.map(measurement => measurement.beatsPerMinute);
  const minBPM = Math.min(...bpmValues);
  const maxBPM = Math.max(...bpmValues);
  const sortedBPM = bpmValues.sort((a, b) => a - b);
  const medianBPM = sortedBPM.length % 2 === 0 ? (sortedBPM[sortedBPM.length / 2 - 1] + sortedBPM[sortedBPM.length / 2]) / 2 : sortedBPM[Math.floor(sortedBPM.length / 2)];
  const latestTimestamp = findLatestTimestamp(measurements);
  return { minBPM, maxBPM, medianBPM, latestTimestamp };
}

// Function to group measurements by day
function groupMeasurementsByDay(measurements) {
  const groupedData = {};
  measurements.forEach(measurement => {
    // Assuming measurement.timestamp is in the format "YYYY-MM-DDTHH:MM:SS"
    const dateKey = new Date(measurement.timestamp).toDateString();
    if (!groupedData[dateKey]) {
      groupedData[dateKey] = [];
    }
    groupedData[dateKey].push(measurement);
  });
  return groupedData;
}

// Function to find the latest timestamp for a given array of measurements
function findLatestTimestamp(measurements) {
  return new Date(Math.max(...measurements.map(measurement => new Date(measurement.timestamp).getTime())));
}
