// Load data from datasets/videogames_wide.csv using d3.csv and then make visualizations
async function fetchData() {
  const dataWide = await d3.csv("./dataset/videogames_wide.csv");
  const dataLong = await d3.csv("./dataset/videogames_long.csv");
  return { dataWide, dataLong };
}

//access to both datasets
fetchData().then(async ({ dataWide, dataLong }) => {
  const dataset = dataWide; //currently used dataset

  //Visualization #1 Cells:
  const salesByPlatformGenre = d3.rollup(
    dataset,
    (v) => d3.sum(v, (d) => +d.Global_Sales),
    (d) => d.Platform,
    (d) => d.Genre,
  );

  const salesByPlatformGenreFlat = Array.from(salesByPlatformGenre).flatMap(
    ([Platform, genreMap]) =>
      Array.from(genreMap, ([Genre, totalSales]) => ({
        Platform,
        Genre,
        totalSales,
      })),
  );

  const encodingSpec1 = {
    encoding: {
      x: {
        field: "totalSales",
        type: "quantitative",
        title: "Global Total Sales (in Millions)",
      },
      y: { field: "Platform", sort: "-x" },
      color: {
        field: "Genre",
      },
      order: { field: "totalSales", aggregate: "sum", sort: "descending" },
      tooltip: [
        { field: "Platform", type: "nominal", title: "Console" },
        { field: "Genre", type: "nominal", title: "Game Genre" },
        {
          field: "totalSales",
          type: "quantitative",
          title: "Total Global Sales (in Millions)",
        },
      ],
    },
  };

  const vlSpec1 = vl
    .markBar()
    .data(salesByPlatformGenreFlat)
    .encode(encodingSpec1.encoding)
    .width("container")
    .height(400)
    .toSpec();

  //Visualization #2 Cells:
  const gamesSales = dataset.filter((d) => !isNaN(+d.Year)); //filter out N/A values

  const gamesSalesParsed = gamesSales.map((d) => ({
    //AI helped to spot and fix parsing issue, since Observable did it automatically
    ...d,
    Year: +d.Year,
    Global_Sales: +d.Global_Sales,
  }));

  const encodingSpec2_1 = {
    encoding: {
      x: {
        field: "Year",
        type: "ordinal",
      },
      y: { field: "Platform", sort: "-x" },
      color: {
        field: "Global_Sales",
        type: "quantitative",
        aggregate: "mean",
        title: "Average Global Sales (in Millions)",
        scale: { type: "log", scheme: "purples" },
      },
      tooltip: [
        { field: "Platform", type: "nominal", title: "Console" },
        { field: "Year", type: "ordinal", title: "Year" },
        {
          field: "Global_Sales",
          type: "quantitative",
          title: "Average Global Sales (in Millions)",
        },
      ],
    },
  };

  const vlSpec2_1 = vl
    .markBar()
    .data(gamesSalesParsed)
    .encode(encodingSpec2_1.encoding)
    .width("container")
    .height(400)
    .toSpec();

  const encodingSpec2_2 = {
    encoding: {
      x: {
        field: "Year",
        type: "ordinal",
      },

      y: {
        field: "Genre",
        type: "nominal",
        sort: {
          field: "Global_Sales",
          op: "mean",
          order: "descending",
        },
      },

      color: {
        field: "Global_Sales",
        type: "quantitative",
        aggregate: "mean",
        title: "Average Global Sales (in Millions)",
        scale: {
          type: "log",
          scheme: "tealblues",
        },
      },

      tooltip: [
        { field: "Genre", type: "nominal", title: "Genre" },
        { field: "Year", type: "ordinal", title: "Year" },
        {
          field: "Global_Sales",
          type: "quantitative",
          aggregate: "mean",
          format: ".2f",
          title: "Average Global Sales (in Millions)",
        },
      ],
    },
  };

  const vlSpec2_2 = vl
    .markBar()
    .data(gamesSalesParsed)
    .encode(encodingSpec2_2.encoding)
    .width("container")
    .height(400)
    .toSpec();

  //Visualization #3 Cells:
  const dataLongParsed = dataLong.map((d) => ({
    ...d,
    Year: +d.Year,
    sales_amount: +d.sales_amount,
  }));

  const salesByPlatformRegion = d3.rollup(
    dataLongParsed,
    (v) => d3.sum(v, (d) => d.sales_amount),
    (d) => d.platform,
    (d) => d.sales_region,
  );

  const salesByPlatformRegionFlat = Array.from(salesByPlatformRegion).flatMap(
    ([platform, regionMap]) =>
      Array.from(regionMap, ([sales_region, totalSales]) => ({
        platform,
        sales_region:
          sales_region === "na_sales"
            ? "North America"
            : sales_region === "eu_sales"
              ? "Europe"
              : sales_region === "jp_sales"
                ? "Japan"
                : "Other Regions",
        totalSales,
      })),
  );

  const encodingSpec3 = {
    encoding: {
      x: {
        field: "totalSales",
        type: "quantitative",
        title: "Total Global Sales (in Millions)",
      },
      y: { field: "platform", type: "nominal", sort: "-x", title: "Console" },
      color: { field: "sales_region", type: "nominal", title: "Sales Region" },
      order: {
        field: "totalSales",
        type: "quantitative",
        aggregate: "sum",
        sort: "descending",
      },
      tooltip: [
        { field: "platform", type: "nominal", title: "Console" },
        { field: "sales_region", type: "nominal", title: "Region" },
        {
          field: "totalSales",
          type: "quantitative",
          title: "Total Global Sales (in Millions)",
          format: ".2f",
        },
      ],
    },
  };

  const vlSpec3 = vl
    .markBar()
    .data(salesByPlatformRegionFlat)
    .encode(encodingSpec3.encoding)
    .width("container")
    .height(400)
    .toSpec();

  //Visualization #4 Cells:

  //EA Data:
  const gamesByEA = dataset.filter((d) => {
    return (
      typeof d.Name === "string" &&
      d.Publisher.toLowerCase().includes("electronic arts")
    );
  });

  const gamesEAPerYear = Array.from(
    d3.rollup(
      gamesByEA,
      (v) => ({
        releaseCount: v.length,
        totalSales: d3.sum(v, (d) => +d.Global_Sales),
      }),
      (d) => +d.Year,
    ),
    ([Year, stats]) => ({
      Year,
      releaseCount: stats.releaseCount,
      totalSales: stats.totalSales,
    }),
  ).filter((d) => !isNaN(d.Year));

  //Nintendo Data:
  const gamesByNintendo = dataset.filter((d) => {
    return (
      typeof d.Name === "string" &&
      d.Publisher.toLowerCase().includes("nintendo")
    );
  });

  const gamesNintendoPerYear = Array.from(
    d3.rollup(
      gamesByNintendo,
      (v) => ({
        releaseCount: v.length,
        totalSales: d3.sum(v, (d) => +d.Global_Sales),
      }),
      (d) => +d.Year,
    ),
    ([Year, stats]) => ({
      Year,
      releaseCount: stats.releaseCount,
      totalSales: stats.totalSales,
    }),
  ).filter((d) => !isNaN(d.Year));

  //Sales Comparing
  const salesEAvNintendo = [
    ...gamesEAPerYear.map((d) => d.totalSales),
    ...gamesNintendoPerYear.map((d) => d.totalSales),
  ];
  const salesMinMax = [d3.min(salesEAvNintendo), d3.max(salesEAvNintendo)];

  //Electronic Arts Chart:
  const encodingSpec4_1 = {
    encoding: {
      x: { field: "Year", type: "ordinal" },
      y: {
        field: "releaseCount",
        type: "quantitative",
        title: "Number of Releases",
      },
      size: {
        field: "totalSales",
        type: "quantitative",
        title: "Global Sales Range (in Millions)",
        scale: { domain: salesMinMax, range: [50, 800] },
      },
      color: {
        field: "totalSales",
        type: "quantitative",
        scale: { domain: salesMinMax, scheme: "Inferno" },
        title: "Average Global Sales (in Millions)",
      },
      tooltip: [
        { field: "Year", type: "ordinal", title: "Year" },
        {
          field: "releaseCount",
          type: "quantitative",
          title: "Number of Releases",
        },
        {
          field: "totalSales",
          type: "quantitative",
          title: "Total Global Sales (in Millions)",
        },
      ],
    },
  };

  const vlSpec4_1 = vl
    .markCircle()
    .data(gamesEAPerYear)
    .encode(encodingSpec4_1.encoding)
    .width("container")
    .height(400)
    .toSpec();

  //Nintendo Chart:
  const encodingSpec4_2 = {
    encoding: {
      x: { field: "Year", type: "ordinal" },
      y: {
        field: "releaseCount",
        type: "quantitative",
        title: "Number of Releases",
      },
      size: {
        field: "totalSales",
        type: "quantitative",
        title: "Global Sales Range (in Millions)",
        scale: { domain: salesMinMax, range: [50, 800] },
      },
      color: {
        field: "totalSales",
        type: "quantitative",
        scale: { domain: salesMinMax, scheme: "Inferno" },
        title: "Average Global Sales (in Millions)",
      },
      tooltip: [
        { field: "Year", type: "ordinal", title: "Year" },
        {
          field: "releaseCount",
          type: "quantitative",
          title: "Number of Releases",
        },
        {
          field: "totalSales",
          type: "quantitative",
          title: "Total Global Sales (in Millions)",
        },
      ],
    },
  };

  const vlSpec4_2 = vl
    .markCircle()
    .data(gamesNintendoPerYear)
    .encode(encodingSpec4_2.encoding)
    .width("container")
    .height(400)
    .toSpec();

  render("#view", vlSpec1);
  render("#view2", vlSpec2_1);
  render("#view3", vlSpec2_2);
  render("#view4", vlSpec3);
  render("#view5", vlSpec4_1);
  render("#view6", vlSpec4_2);
});

async function render(viewID, spec) {
  const result = await vegaEmbed(viewID, spec);
  result.view.run();
}
