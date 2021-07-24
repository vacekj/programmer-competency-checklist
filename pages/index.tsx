import Layout from "components/Layout";
import { Box, Container, Heading, SimpleGrid, VStack } from "@chakra-ui/react";
import firebase from "firebase";
import { Category, header, matrix } from "../util/CompetencyMatrix";
import { ReactNode, useState } from "react";
import dynamic from "next/dynamic";

const firebaseConfig = {
	apiKey: "AIzaSyDTZ36ccjPBDaRpu6gdJK2dVfpM_VINbW0",
	authDomain: "programmer-competency-check.firebaseapp.com",
	projectId: "programmer-competency-check",
	storageBucket: "programmer-competency-check.appspot.com",
	messagingSenderId: "259674139410",
	appId: "1:259674139410:web:3705e8d53bea76ac24e1cb",
	measurementId: "G-BRRM8JK57W",
};
if (typeof window !== "undefined" && !firebase.apps.length) {
	firebase.initializeApp(firebaseConfig);
}

const IndexPage = () => {
	return (
		<Layout title="Programmer Competency Checklist">
			<Container mt={10} maxW={["full", 960, "full"]}>
				<VStack
					spacing={20}
					justifyContent={"center"}
					alignItems={"center"}
				>
					{matrix.map((category) => (
						<CategoryView key={category.name} category={category} />
					))}
				</VStack>
			</Container>
		</Layout>
	);
};

function CategoryView(props: { category: Category }) {
	const [checked, setChecked] = useLocalStorage<boolean[][]>(
		"checked" + props.category.name,
		props.category.rows.map((r) => r.map(() => false))
	);

	return (
		<VStack>
			<Heading mb={3} as={"h2"} fontSize={"3xl"}>
				{props.category.name}
			</Heading>
			<Box>
				{checked.flat().filter((a) => a).length} /{" "}
				{checked.flat().length}
			</Box>
			<SimpleGrid p={10} columns={6} spacing={7}>
				{header.map((h, i) => (
					<HeaderCell
						done={checked.map((row) => row[i - 1]).every((a) => a)}
						key={"h" + i}
					>
						{h}
					</HeaderCell>
				))}
				{props.category.rows.map((row, rowNumber) => (
					<>
						<FirstCell key={row[0]}>{row[0]}</FirstCell>
						{row.slice(1, row.length - 1).map((col, colNumber) => (
							<TableCell
								key={col}
								rowNumber={rowNumber}
								colNumber={colNumber}
								checked={checked[rowNumber][colNumber]}
								onClick={() => {
									let newChecked = [...checked];
									if (checked[rowNumber][colNumber]) {
										// uncheck this and any following tiles
										for (
											let i = colNumber;
											i < row.length;
											i++
										) {
											newChecked[rowNumber][i] = false;
										}
									} else {
										// check this and any previous tiles
										for (let i = 0; i <= colNumber; i++) {
											newChecked[rowNumber][i] = true;
										}
									}
									setChecked(newChecked);
								}}
							>
								{col}
							</TableCell>
						))}
						<Comment key={"c" + rowNumber}>
							{row[row.length - 1]}
						</Comment>
					</>
				))}
			</SimpleGrid>
		</VStack>
	);
}

function HeaderCell(props: { children: ReactNode; done: boolean }) {
	return (
		<Box
			transition={"all 0.2s ease-in-out"}
			rounded={"xl"}
			bg={props.done ? "green.100" : ""}
			p={3}
		>
			{props.children}
		</Box>
	);
}

function FirstCell(props: { children: ReactNode }) {
	return (
		<Box p={3} textAlign={"right"} fontWeight={"bold"}>
			{props.children}
		</Box>
	);
}

function TableCell(props: {
	children: ReactNode;
	rowNumber: number;
	colNumber: number;
	checked: boolean;
	onClick: () => void;
}) {
	return (
		<Box
			transition={"all 0.2s ease-in-out"}
			cursor={"pointer"}
			_hover={{
				bg: props.checked ? "green.100" : "green.50",
			}}
			bg={props.checked ? "green.100" : "white"}
			onClick={props.onClick}
			rounded={"xl"}
			shadow={"xs"}
			p={5}
		>
			{props.children}
		</Box>
	);
}

function Comment(props: { children: ReactNode }) {
	return <Box p={3}>{props.children}</Box>;
}

function useLocalStorage<T>(key: string, initialValue: T) {
	// State to store our value
	// Pass initial state function to useState so logic is only executed once
	const [storedValue, setStoredValue] = useState<T>(() => {
		try {
			// Get from local storage by key
			const item = window.localStorage.getItem(key);
			// Parse stored json or if none return initialValue
			return item ? JSON.parse(item) : initialValue;
		} catch (error) {
			// If error also return initialValue
			console.log(error);
			return initialValue;
		}
	});
	// Return a wrapped version of useState's setter function that ...
	// ... persists the new value to localStorage.
	const setValue = (value: T) => {
		try {
			// Allow value to be a function so we have same API as useState
			const valueToStore =
				value instanceof Function ? value(storedValue) : value;
			// Save state
			setStoredValue(valueToStore);
			// Save to local storage
			window.localStorage.setItem(key, JSON.stringify(valueToStore));
		} catch (error) {
			// A more advanced implementation would handle the error case
			console.log(error);
		}
	};
	return [storedValue, setValue] as [T, (value: T) => void];
}

export default dynamic(() => Promise.resolve(IndexPage), {
	ssr: false,
});
