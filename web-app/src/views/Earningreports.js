import React,{ useState,useEffect } from 'react';
import MaterialTable from 'material-table';
import { useSelector} from "react-redux";
import CircularLoading from "../components/CircularLoading";
import { useTranslation } from "react-i18next";
import {colors} from '../components/Theme/WebTheme';
import {  SECONDORY_COLOR } from "../common/sharedFunctions";
import { ThemeProvider } from '@mui/material/styles';
import theme from "styles/tableStyle";
import TableStyle from '../components/Table/Style';
import localization from '../components/Table/Localization';

export default function Earningreports() {
  const { t,i18n } = useTranslation();
  const isRTL = i18n.dir();
  
  const settings = useSelector(state => state.settingsdata.settings);

  function formatAmount(value, decimal, country) {
    const number = parseFloat(value || 0);
    if (country === "Vietnam") {
      return number.toLocaleString("vi-VN", {
        minimumFractionDigits: decimal,
        maximumFractionDigits: decimal
      });
    } else {
      return number.toLocaleString("en-US", {
        minimumFractionDigits: decimal,
        maximumFractionDigits: decimal
      });
    }
  }

  const columns =  [
    { title: t('year'),field: 'year'},
    { title: t('months'), field: 'monthsName'},
    { title: t('booking_count'), field: 'total_rides'},
    { title: t('Gross_trip_cost'), render: rowData => formatAmount((parseFloat(rowData.tripCost) + parseFloat(rowData.cancellationFee)), settings.decimal, settings.country) , editable:'never'},
    { title: t('trip_cost_driver_share'), field: 'rideCost', render: rowData => formatAmount(rowData.rideCost, settings.decimal, settings.country)},
    { title: t('cancellationFee'), field: 'cancellationFee', render: rowData => formatAmount(rowData.cancellationFee, settings.decimal, settings.country)},
    { title: t('convenience_fee'), field: 'convenienceFee', render: rowData => formatAmount(rowData.convenienceFee, settings.decimal, settings.country)},
    { title: t('convenience_fee'), field: 'fleetadminFee', render: rowData => formatAmount(rowData.fleetadminFee, settings.decimal, settings.country)},
    { title: t('Discounts'), field: 'discountAmount', render: rowData => formatAmount(rowData.discountAmount, settings.decimal, settings.country)},
    { title: t('Profit'),  render: rowData => formatAmount((parseFloat(rowData.convenienceFee) + parseFloat(rowData.cancellationFee) - parseFloat(rowData.discountAmount)), settings.decimal, settings.country) , editable:'never'}
  ];

  const [data, setData] = useState([]);
  const earningreportsdata = useSelector(state => state.earningreportsdata);

  useEffect(()=>{
        if(earningreportsdata.Earningreportss){
            setData(earningreportsdata.Earningreportss);
        }
  },[earningreportsdata.Earningreportss]);

  const [selectedRow, setSelectedRow] = useState(null);

  return (
    earningreportsdata.loading? <CircularLoading/>:
    <ThemeProvider theme={theme}>
      <MaterialTable
        title={t('earning_reports_title')}
        columns={columns}
        style={{
          direction: isRTL === "rtl" ? "rtl" : "ltr",
          borderRadius: "8px",
          padding: "20px",
          boxShadow: `0px 2px 5px ${SECONDORY_COLOR}`,
        }}
        data={data}
        
        onRowClick={((evt, selectedRow) => setSelectedRow(selectedRow.tableData.id))}
        options={{
          exportButton: true,
          rowStyle: (rowData) => ({
            backgroundColor:
              selectedRow === rowData.tableData.id ? colors.ROW_SELECTED :colors.WHITE
          }),
          ...TableStyle()
        }}
        localization={localization(t)}
      />
    </ThemeProvider>
  );
}