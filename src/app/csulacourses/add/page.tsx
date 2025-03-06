"use client";

import { useState } from "react";
import { Description, Fieldset, Label } from "@/components/fieldset";
import { Input } from "@/components/input";
import { Select } from "@/components/select";
import { Checkbox, CheckboxField, CheckboxGroup } from "@/components/checkbox";
import * as Headless from "@headlessui/react";
import { Dialog, DialogActions, DialogDescription, DialogTitle } from "@/components/dialog";
import { Button } from "@/components/button";

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/csula-courses`;

// Hardcoded department list
const departmentList = [
  { id: "EE", name: "Electrical and Computer Engineering" },
  { id: "CS", name: "Computer Science" }
];

const termOptions = ["Fall", "Spring", "Summer", "Winter"];

export default function AddCSULACoursePage() {
    const [courseName, setCourseName] = useState("");
    const [courseCode, setCourseCode] = useState<string[]>([]);
    const [credits, setCredits] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState("");
    const [coRequisiteCodes, setCoRequisiteCodes] = useState<string[]>([]);
    const [coRequisiteDescription, setCoRequisiteDescription] = useState("");
    const [preRequisiteCodes, setPreRequisiteCodes] = useState<string[]>([]);
    const [courseType, setCourseType] = useState("");
    const [isPreAndCoreqAreSame, setIsPreAndCoreqAreSame] = useState(null);
    const [selectedTerms, setSelectedTerms] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [showErrorDialog, setShowErrorDialog] = useState(false);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);

    const handleCourseCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setCourseCode(
        value
            .replace(/[^a-zA-Z0-9, _-]/g, "")
            .split(",")
            .map((code) => code.trimStart())
        );
    };

    const handleCoRequisiteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setCoRequisiteCodes(
        value
            .replace(/[^a-zA-Z0-9, _-]/g, "")
            .split(",")
            .map((code) => code.trimStart())
        );
    };

    const handlePreRequisiteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPreRequisiteCodes(
        value
            .replace(/[^a-zA-Z0-9, _-]/g, "")
            .split(",")
            .map((code) => code.trimStart())
        );
    };

    const handleTermSelection = (term: string) => {
        setSelectedTerms((prev) =>
        prev.includes(term) ? prev.filter((t) => t !== term) : [...prev, term]
        );
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!courseName.trim()) {
        setError("Course name is required.");
        setShowErrorDialog(true);
        return;
        }

        if (courseCode.length === 0) {
        setError("At least one course code is required.");
        setShowErrorDialog(true);
        return;
        }

        if (!selectedDepartment) {
        setError("Please select a department.");
        setShowErrorDialog(true);
        return;
        }

        try {
        const res = await fetch(apiUrl, {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify({
                course_name: courseName,
                course_code: courseCode,
                credits: Number(credits),
                department: [{ id: selectedDepartment, name: departmentList.find(dep => dep.id === selectedDepartment)?.name || "" }],
                co_requisite: {
                    course_code: coRequisiteCodes,
                    description: coRequisiteDescription
                },
                pre_requisite: {
                    course_code: preRequisiteCodes,
                    description: ""
                },
                course_type: courseType,
                isPreAndCoreqAreSame: isPreAndCoreqAreSame,
                term: selectedTerms,
            }),
    });

    const responseData = await res.json();

    if (!res.ok) {
        throw new Error(responseData.error || "Failed to add course.");
    }

    setShowSuccessDialog(true);
    } catch (err) {
      console.error("Error adding course:", err);
      setError("Failed to add course.");
      setShowErrorDialog(true);
    }
  };

  return (
    <>
        <form onSubmit={handleSubmit}>
        <Fieldset>
        <div className="grid grid-cols-1 mt-10 items-center gap-x-4 gap-y-6 sm:grid-cols-3">
            <Headless.Field className="grid grid-cols-subgrid sm:col-span-3">
                <Label>Course Name</Label>
                <Input className="mt-3 sm:col-span-2 sm:mt-0" value={courseName} onChange={(e) => setCourseName(e.target.value)} required />
                <Description>e.g. General Physics I, Mechanics</Description>
            </Headless.Field>
            <Headless.Field className="grid grid-cols-subgrid sm:col-span-3">
                <Label>Course Code</Label>
                <Input className="mt-3 sm:col-span-2 sm:mt-0" value={courseCode.join(", ")} onChange={handleCourseCodeChange} required />
                <Description>Separate multiple codes with commas, e.g., PHYS 2100, MATH 1000</Description>
            </Headless.Field>
            <Headless.Field className="grid grid-cols-subgrid sm:col-span-3">
                <Label>Credits</Label>
                <Input className="mt-3 sm:col-span-2 sm:mt-0" type="number" value={credits} onChange={(e) => setCredits(e.target.value)} required />
                <Description>e.g. 5</Description>
            </Headless.Field>
            <Headless.Field className="grid grid-cols-subgrid sm:col-span-3">
                <Label>Department</Label>
                <Select className="mt-3 sm:col-span-2 sm:mt-0" value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)} required>
                    <option value="">Select a department</option>
                    {departmentList.map(dep => (
                    <option key={dep.id} value={dep.id}>{dep.name}</option>
                    ))}
                </Select>
            </Headless.Field>
            <Headless.Field className="grid grid-cols-subgrid sm:col-span-3">
                <Label>Co-requisite Courses</Label>
                <Input className="mt-3 sm:col-span-2 sm:mt-0"  value={coRequisiteCodes.join(", ")} onChange={handleCoRequisiteChange} />
                <Description>Separate multiple codes with commas, e.g., PHYS 2200, MATH 2000</Description>
            </Headless.Field>
            <Headless.Field className="grid grid-cols-subgrid sm:col-span-3">
                <Label>Co-requisite Description</Label>
                <Input className="mt-3 sm:col-span-2 sm:mt-0" value={coRequisiteDescription} onChange={(e) => setCoRequisiteDescription(e.target.value)} />
            </Headless.Field>
            <Headless.Field className="grid grid-cols-subgrid sm:col-span-3">
                <Label>Pre-requisite Courses</Label>
                <Input className="mt-3 sm:col-span-2 sm:mt-0" value={preRequisiteCodes.join(", ")} onChange={handlePreRequisiteChange} />
                <Description>Separate multiple codes with commas, e.g., MATH 2110</Description>
            </Headless.Field>
            <Headless.Field className="grid grid-cols-subgrid sm:col-span-3">
                <Label>Course Type</Label>
                <Input className="mt-3 sm:col-span-2 sm:mt-0"  value={courseType} onChange={(e) => setCourseType(e.target.value)} />
                <Description>e.g. lower_division</Description>
            </Headless.Field>
            <Headless.Field className="grid grid-cols-subgrid sm:col-span-3">
                <Label>Are pre-requisites and co-requisites the same?</Label>
                <Select 
                    className="mt-3 sm:col-span-2 sm:mt-0" 
                    value={isPreAndCoreqAreSame === null ? "" : isPreAndCoreqAreSame ? "Yes" : "No"} 
                    onChange={(e) => setIsPreAndCoreqAreSame(e.target.value === "Yes")}
                    required
                >
                    <option value="" disabled>Please select Yes or No</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                </Select>
            </Headless.Field>
            <Headless.Field className="grid grid-cols-subgrid sm:col-span-3">
                <Label>Terms Offered</Label>
                <CheckboxGroup >
                    {termOptions.map(term => (
                    <CheckboxField key={term}>
                        <Checkbox checked={selectedTerms.includes(term)} onChange={() => handleTermSelection(term)} />
                        <Label>{term}</Label>
                    </CheckboxField>
                    ))}
                </CheckboxGroup>
            </Headless.Field>
        </div>
        </Fieldset>

        <div className="flex justify-end mt-4 space-x-4">
            <button type="submit" className="w-32 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700">
                Add
            </button>
            <button
                type="reset"
                onClick={() => {
                    setCourseName("");
                    setCourseCode([]);
                    setCredits("");
                    setSelectedDepartment("");
                    setCoRequisiteCodes([]);
                    setCoRequisiteDescription("");
                    setPreRequisiteCodes([]);
                    setCourseType("");
                    setIsPreAndCoreqAreSame(null);
                    setSelectedTerms([]);
                }}
                className="w-32 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
                Clear
            </button>
            <a href="/csula-courses" className="w-32 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 text-center">
                Cancel
            </a>
        </div>
      </form>

      <Dialog open={showErrorDialog} onClose={setShowErrorDialog}>
        <DialogTitle>Error</DialogTitle>
        <DialogDescription>{error}</DialogDescription>
        <DialogActions>
            <Button onClick={() => setShowErrorDialog(false)}>Confirm</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showSuccessDialog} onClose={setShowSuccessDialog}>
        <DialogTitle>Success</DialogTitle>
        <DialogDescription>CSULA Course added successfully.</DialogDescription>
        <DialogActions>
            <Button onClick={() => setShowSuccessDialog(false)}>Confirm</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
