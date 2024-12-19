import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

const ServerDataTable = ({ serverData }: any) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell rowSpan={2}>Host</TableCell>
            <TableCell rowSpan={2}>Provider</TableCell>
            <TableCell rowSpan={2}>Status</TableCell>
            <TableCell colSpan={3} align="center">
              Available IPs
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>IP Address</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Went Spam</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {serverData.map((server: any, index: number) => (
            <TableRow key={index}>
              <TableCell>{server.host}</TableCell>
              <TableCell>{server.provider}</TableCell>
              <TableCell>{server.status}</TableCell>
              <TableCell colSpan={3}>
                {server?.availableIps?.map((ip: any, ipIndex: number) => (
                  <TableRow key={ipIndex}>
                    <TableCell align="left">{ip.ip}</TableCell>
                    <TableCell>
                      {ip.isMainIp ? "Main IP" : "Secondary IP"}
                    </TableCell>
                    <TableCell align="center">
                      {ip.wentSpam ? "Yes" : "No"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ServerDataTable;
