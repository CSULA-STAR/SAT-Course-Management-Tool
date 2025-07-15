'use client'

import axios from "axios";
import { useEffect, useState } from "react";
import { Box, Stack, Button, Typography, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from "@mui/material";

const Autoimport = () => {
  const [college, setCollege] = useState<any>(null);
  const [schools, setSchools] = useState<Array<{ label: string; value: any }>>([]);
  const [programs, setPrograms] = useState<Array<{ label: string; value: any }>>([]);
  const [selectedProgram, setSelectedProgram] = useState<any>(null);

  const handleCollegeChange = (event: SelectChangeEvent) => {
    const selectedValue = event.target.value;
    setCollege(selectedValue);
    setSelectedProgram(null);
  };

  const handleProgramChange = (event: SelectChangeEvent) => {
    const selectedValue = event.target.value;
    setSelectedProgram(selectedValue);
  };

  const handleSubmit = () => {
    if (!college || !selectedProgram) {
      alert("Please select both school and program before submitting.");
      return;
    }
    const url = `/autoimport/map?s_id=${college.id}&dept=${selectedProgram.department}`;
    window.open(url, '_blank');
  };

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const response = await axios.get("http://localhost:3001/fetch-institutes");
        setSchools(
          response.data.map((college: any) => ({
            label: college.name,
            value: college,
          }))
        );
      } catch (error) {
        console.error("Error fetching colleges:", error);
      }
    };

    fetchColleges();
  }, []);

  useEffect(() => {
    const fetchPrograms = async () => {
      if (college) {
        try {
          const response = await axios.get(`http://localhost:3001/fetch-programs?collegeId=${college.id}`);
          setPrograms(
            response.data.map((program: any) => ({
              label: program.name,
              value: program,
            }))
          );
        } catch (error) {
          console.error("Error fetching programs:", error);
        }
      } else {
        setPrograms([]);
      }
    };

    fetchPrograms();
  }, [college]);

  return (
    <Box
      sx={{
        height: "80vh",
        width: "100vw",
        textAlign: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box>
        <Stack direction="column" alignItems="center" spacing={2}>
          <Box>
            <img src="calstatelaLogo.png" alt="Cal State LA Logo" style={{ width: 150, height: 150 }} />
          </Box>
          <Typography
            variant="h5"
            component="div"
            px={5}
            pb={3}
            fontSize={{ sm: 20 }}
            textAlign="center"
          >
            Please select the school you transfer from and the Cal State LA program
            you want to transfer to
          </Typography>

          <FormControl sx={{ minWidth: 250 }}>
            <InputLabel id="college-label">From School</InputLabel>
            <Select
              labelId="college-label"
              id="college-select"
              value={college || ''}
              label="From School"
              onChange={handleCollegeChange}
              renderValue={(selected) => (selected ? (selected as any).name : '')}
            >
              {schools.map((school) => (
                <MenuItem key={school.value.id} value={school.value}>
                  {school.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 250 }}>
            <InputLabel id="program-label">To Cal State LA program</InputLabel>
            <Select
              labelId="program-label"
              id="program-select"
              value={selectedProgram || ''}
              label="To Cal State LA program"
              onChange={handleProgramChange}
              renderValue={(selected) => (selected ? (selected as any).name : '')}
              disabled={!college}
            >
              {programs.map((program) => (
                <MenuItem key={program.value.id} value={program.value}>
                  {program.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              backgroundColor: "#FFCE00",
              "&:hover": {
                backgroundColor: "#e6bd00",
              },
            }}
          >
            Autoimport
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default Autoimport;