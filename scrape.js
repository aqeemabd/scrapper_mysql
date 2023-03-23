const fs = require("fs");
const cheerio = require("cheerio");
const axios = require("axios");
const mysql = require("mysql");
const config = require("./config");
// const { log } = require("console");

const connection = mysql.createConnection(config.db);

const scrapper = async () => {
  try {
    const { data } = await axios.get(config.scrape_url);

    const $ = cheerio.load(data);

    const infoEl = $("#myTable > tbody > tr:nth-child(n+2)");

    const scrappedData = [];

    infoEl.each((index, el) => {
      const scrappedItem = {
        NEGERI: "",
        LOKALI: "",
        KES: "",
        TARIKH: "",
        TEMPOH: "",
      };
      scrappedItem.NEGERI = $(el).children("td:nth-child(2)").text();
      scrappedItem.LOKALI = $(el).children("td:nth-child(3)").text();
      scrappedItem.KES = $(el).children("td:nth-child(4)").text();
      scrappedItem.TARIKH = $(el).children("td:nth-child(5)").text();
      scrappedItem.TEMPOH = $(el)
        .children("tr:nth-child(n+2) > td:nth-child(6)")
        .text();
      scrappedData.push(scrappedItem);
    });
    // fs.writeFile(
    //   "scrapedInfo.json",
    //   JSON.stringify(scrappedData, null, 2),
    //   (e) => {
    //     if (e) {
    //       console.log(e);
    //       return;
    //     }
    //     console.log("scraping completed");
    //   }
    // );

    if (scrappedData && scrappedData.length > 0) {
      connection.connect((err) =>  {
        if (err) throw err;

        var map_data = scrappedData.map(data => [data.NEGERI, data.LOKALI, data.KES, data.TARIKH, data.TEMPOH])
        var sql = `INSERT INTO hotspot_loc (state, address, cumulative_case, epidemic_start_date, epidemic_period) values ?`;

        connection.query('TRUNCATE TABLE hotspot_loc', (err) => {
          if (err) throw err;
        });
        connection.query(sql, [map_data], (err) => {
          if (err) throw err;
        });

        update_coordinate();

      });
    }
  } catch (error) {
    console.log(error);
  }
};

let update_coordinate = async () => {
  connection.query('Select * from hotspot_loc WHERE latitude IS NULL AND longitude IS NULL', async (err, result, fields) => {
    if (err)
      throw err;
    if (result.length > 0) {
      for (let i = 0; i < result.length; i++) {
        let geometry = await get_coordinate(result[i].address);
        
        connection.query(`UPDATE hotspot_loc SET latitude = ${geometry.lat}, longitude = ${geometry.lng} WHERE location_id = ${result[i].location_id}`, (err) => {
          if (err) throw err;
        });

        if(result.length - 1 === i) {
          connection.end();
        }

      }
    }
  })
}

let get_coordinate = async (address) => {

  let string_replaced = address.split(' ').join('+');
  let GOOLE_MAP_URL = `https://maps.googleapis.com/maps/api/geocode/json?address=${string_replaced}&key=${config.google_key}`;

  let geocode = {
    lat: null,
    lng: null,
  }

  const { data } = await axios.get(GOOLE_MAP_URL);

  geocode.lat = data.results[0]?.geometry.location.lat ?? null;
  geocode.lng = data.results[0]?.geometry.location.lng ?? null;

  return geocode
}

scrapper();
