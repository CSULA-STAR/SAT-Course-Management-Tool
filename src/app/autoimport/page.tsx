'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/button";
import { Select } from "@/components/select";
import { Text } from "@/components/text";
import { Fieldset, Field, Label } from "@/components/fieldset";

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/../fetch-institutes`;
const programsApiUrl = `${process.env.NEXT_PUBLIC_API_URL}/../fetch-programs`;

// Define proper TypeScript interfaces
interface College {
  id: string;
  name: string;
}

interface Program {
  id: string;
  name: string;
  department: string;
}

interface SelectOption {
  label: string;
  value: College | Program;
}

export default function Page() {
  const router = useRouter();
  const [college, setCollege] = useState<College | null>(null);
  const [schools, setSchools] = useState<SelectOption[]>([]);
  const [programs, setPrograms] = useState<SelectOption[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  const handleCollegeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    const selectedCollege = schools.find(school => school.value.id === selectedValue)?.value as College;
    setCollege(selectedCollege || null);
    setSelectedProgram(null);
  };

  const handleProgramChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    const selectedProgramOption = programs.find(program => program.value.id === selectedValue)?.value as Program;
    setSelectedProgram(selectedProgramOption || null);
  };

  const handleSubmit = () => {
    if (!college || !selectedProgram) {
      alert("Please select both school and program before submitting.");
      return;
    }
    const url = `/autoimport/map?s_id=${college.id}&dept=${selectedProgram.department}`;
    router.push(url);
  };

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        setSchools(
          data.map((college: College) => ({
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
          const response = await fetch(`${programsApiUrl}?collegeId=${college.id}`);
          const data = await response.json();
          setPrograms(
            data.map((program: Program) => ({
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
    <div className="min-h-screen bg-white dark:bg-zinc-900 flex justify-center p-4">
      <div className="max-w-md w-full space-y-4">
        <div className="text-center">
          <div className="mb-1">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-4">
              Courses Auto Import
            </h1>
            <Text className="text-lg font-medium text-zinc-900 dark:text-white mb-8 px-4">
              This tool uses a scraper to automatically import course information from assist.org.
              If the institution or program is not listed in the options below, please add them first.
            </Text>
          </div>
        </div>

        <Fieldset>
          <Field className="mb-4">
            <Label htmlFor="college-select">From institution</Label>
            <Select
              id="college-select"
              value={college?.id || ''}
              onChange={handleCollegeChange}
            >
              <option value="">Select a school</option>
              {schools.map((school) => (
                <option key={school.value.id} value={school.value.id}>
                  {school.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field>
            <Label htmlFor="program-select">To Cal State LA program</Label>
            <Select
              id="program-select"
              value={selectedProgram?.id || ''}
              onChange={handleProgramChange}
              disabled={!college}
            >
              <option value="">Select a program</option>
              {programs.map((program) => (
                <option key={program.value.id} value={program.value.id}>
                  {program.label}
                </option>
              ))}
            </Select>
          </Field>

          <div className="pt-4">
            <Button
              onClick={handleSubmit}
              color="blue"
              className="w-full"
              disabled={!college || !selectedProgram}
            >
              Autoimport
            </Button>
          </div>
        </Fieldset>
      </div>
    </div>
  );
}