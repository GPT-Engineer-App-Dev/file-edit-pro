import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLocation } from "react-router-dom";

const Index = () => {
  const location = useLocation();
  const [csvData, setCsvData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [editingRow, setEditingRow] = useState(null);
  const [newRow, setNewRow] = useState({});

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const lines = content.split('\n');
      const headers = lines[0].split(',');
      setHeaders(headers);
      const data = lines.slice(1).map(line => {
        const values = line.split(',');
        return headers.reduce((obj, header, index) => {
          obj[header] = values[index];
          return obj;
        }, {});
      });
      setCsvData(data);
    };
    reader.readAsText(file);
  };

  const handleDownload = () => {
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => row[header]).join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'exported_data.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleEdit = (index) => {
    setEditingRow(index);
    setNewRow(csvData[index]);
  };

  const handleDelete = (index) => {
    const newData = [...csvData];
    newData.splice(index, 1);
    setCsvData(newData);
  };

  const handleSave = () => {
    if (editingRow !== null) {
      const newData = [...csvData];
      newData[editingRow] = newRow;
      setCsvData(newData);
      setEditingRow(null);
    } else {
      setCsvData([...csvData, newRow]);
    }
    setNewRow({});
  };

  const handleCancel = () => {
    setEditingRow(null);
    setNewRow({});
  };

  const handleInputChange = (header, value) => {
    setNewRow({ ...newRow, [header]: value });
  };

  if (location.pathname !== "/csv-tool") {
    return (
      <div className="text-center">
        <h1 className="text-3xl">Welcome to CSV Management Tool</h1>
        <p>Navigate to the CSV Tool page to start managing your CSV files.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">CSV Management Tool</h1>
      <div className="flex justify-between mb-4">
        <Input type="file" accept=".csv" onChange={handleFileUpload} className="max-w-xs" />
        <Button onClick={handleDownload} disabled={csvData.length === 0}>Download CSV</Button>
      </div>
      {csvData.length > 0 && (
        <>
          <Table className="mb-4">
            <TableHeader>
              <TableRow>
                {headers.map((header, index) => (
                  <TableHead key={index}>{header}</TableHead>
                ))}
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {csvData.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {headers.map((header, cellIndex) => (
                    <TableCell key={cellIndex}>{row[header]}</TableCell>
                  ))}
                  <TableCell>
                    <Button onClick={() => handleEdit(rowIndex)} className="mr-2">Edit</Button>
                    <Button onClick={() => handleDelete(rowIndex)} variant="destructive">Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">{editingRow !== null ? 'Edit Row' : 'Add New Row'}</h2>
            {headers.map((header, index) => (
              <Input
                key={index}
                placeholder={header}
                value={newRow[header] || ''}
                onChange={(e) => handleInputChange(header, e.target.value)}
                className="mb-2"
              />
            ))}
            <Button onClick={handleSave} className="mr-2">Save</Button>
            <Button onClick={handleCancel} variant="outline">Cancel</Button>
          </div>
        </>
      )}
    </div>
  );
};

export default Index;