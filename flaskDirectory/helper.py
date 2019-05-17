import pandas as pd


stateCode = {
	'Alabama': 'AL',
	'Alaska': 'AK',
	'Arizona': 'AZ',
	'Arkansas': 'AR',
	'California': 'CA',
	'Colorado': 'CO',
	'Connecticut': 'CT',
	'District Of Columbia': 'DC',
	'Delaware': 'DE',
	'Florida': 'FL',
	'Georgia': 'GA',
	'Hawaii': 'HI',
	'Idaho': 'ID',
	'Illinois': 'IL',
	'Indiana': 'IN',
	'Iowa': 'IA',
	'Kansas': 'KS',
	'Kentucky': 'KY',
	'Louisiana': 'LS',
	'Maine': 'ME',
	'Maryland': 'MD',
	'Massachusetts': 'MA',
	'Michigan': 'MI',
	'Minnesota': 'MN',
	'Mississippi': 'MS',
	'Missouri': 'MO',
	'Montana': 'MT',
	'Nebraska': 'NE',
	'Nevada': 'NV',
	'New Hampshire': 'NH',
	'New Jersey': 'NJ',
	'New Mexico': 'NM',
	'New York': 'NY',
	'North Carolina': 'NC',
	'North Dakota': 'ND',
	'Ohio': 'OH',
	'Oklahoma': 'OK',
	'Oregon': 'OR',
	'Pennsylvania': 'PA',
	'Rhode Island': 'RI',
	'South Carolina': 'SC',
	'South Dakota': 'SD',
	'Tennessee': 'TN',
	'Texas': 'TX',
	'Utah': 'UT',
	'Vermont': 'VT',
	'Virginia': 'VA',
	'Washington': 'WA',
	'West Virginia': 'WV',
	'Wisconsin': 'WI',
	'Wyoming': 'WY',
}

data = ["Alabama","Alaska","Arizona","Arkansas","California","Colorado",
	"Connecticut","Delaware","District of Columbia","Florida","Georgia",
	"Hawaii","Idaho","Illinois", "Indiana","Iowa","Kansas","Kentucky",
	"Louisiana","Maine","Maryland", "Massachusetts","Michigan","Minnesota",
	"Mississippi","Missouri","Montana", "Nebraska","Nevada","New Hampshire",
	"New Jersey","New Mexico","New York", "North Carolina","North Dakota",
	"Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina",
	"South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington",
	"West Virginia","Wisconsin","Wyoming"
	]


def getStateRow(state):
	return  data.index(state)

def getDataFrame(filename):
	dataframe = pd.read_csv('Dataset/'+filename)
	return dataframe

def getDataFrameBasedOnYear(filename):
	dataframe = pd.read_csv('NayawalaDataset/'+filename)
	return dataframe

def getAggregateData():
	dataframe = pd.read_csv('NayawalaDataset/Aggregate_Data.csv')
	return dataframe

def getDataToSend(dataframe):
	states = dataframe['STATE'].tolist()
	dataframe['ID'] = [stateCode[i] for i in states]
	cols = dataframe.columns.tolist()
	data = { dataframe['ID'][i]: { j: dataframe[j][i] for j in cols } for i in range(len(dataframe))}
	data = pd.io.json.dumps(data)
	return data