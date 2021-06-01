import { Box, Container, Typography } from "@material-ui/core";
import SearchBar from "components/SearchBar";

export default function HomePage() {
  return <Container>
    <Box marginY={2}>
      <SearchBar currentTokenAddress={null}></SearchBar>
    </Box>
    <Typography variant="h4" gutterBottom>
      Welcome to tzcharts!
    </Typography>
    <Typography variant="body1">
      Token information is retrieved using tzkt.io and better-call.dev's APIs.
      <br/>
      <br/>
      Token price information retrieved from QuipusSwap's FA1.2 and FA2 swap contracts.
      <br/>
      <br/>
      This tool is currently in beta. All price information are loaded on page load,
      and do not refresh automatically.
    </Typography>
  </Container>
}
