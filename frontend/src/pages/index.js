import * as React from "react";
import { useState, useEffect } from "react";
import { Grid, GridColumn as Column } from "@progress/kendo-react-grid";
import { filterBy } from "@progress/kendo-data-query";
import "@progress/kendo-theme-default/dist/all.css";

import "dotenv/config";

const HomePage = () => {
  const initialFilter = {
    logic: "and",
    filters: [
      {
        field: "type",
        operator: "contains",
        value: "",
      },
    ],
  };

  const [data, setData] = useState({ data: [] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiKey = process.env.GIPHY_API_KEY;
        let response = await fetch(
          "https://api.giphy.com/v1/gifs/trending?api_key=" +
            apiKey +
            "&limit=25&offset=0&rating=g&bundle=messaging_non_clips"
        );
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const [filter, setFilter] = React.useState(initialFilter);

  return (
    <div>
      <Grid
        data={filterBy(data.data, filter)}
        filterable={true}
        filter={filter}
        onFilterChange={(e) => setFilter(e.filter)}
      >
        <Column field="type" title="type" width="250px" />
        <Column field="id" title="id" width="250px" />
        <Column field="url" title="url" width="250px" />
        <Column field="slug" title="slug" width="250px" />
        <Column field="username" title="username" width="250px" />
        <Column field="bitly_url" title="bitly_url" width="250px" />
        <Column field="embed_url" title="embed_url" width="250px" />
      </Grid>
    </div>
  );
};

export default HomePage;
