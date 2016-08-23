import re, glob

function_filter = '}\n\t\w+\('
constructor_filter = 'constructor\(props\) {[\s\S]+?}\n\t[A-z]'
file_glob = raw_input('Enter a glob to parse. ')

def parse(file_glob):
	globbed = glob.glob(file_glob)
	if not globbed:
		print "Glob not found."
		return
	for filename in globbed:
		if filename[-4:] == '.jsx':
			file = open(filename, 'r')
			text = file.read()
			file.close()
			hits = re.findall(function_filter, text)
			constructors_found = re.findall(constructor_filter, text)
			if constructors_found:
				constructor = constructors_found[0][:-6]
				constructor_with_binding = constructor
				for hit in hits:
					hit = hit[3:-1]
					if hit not in ['render', 'componentDidMount', 'componentWillMount', 'componentWillUpdate', 'componentShouldUpdate', 'componentWillUnmount', 'getDefaultProps', 'getInitialState']:
						constructor_with_binding += '\n\t\tthis.%s = this.%s.bind(this);' % (hit, hit)
				text = text.replace(constructor, constructor_with_binding)
				file = open(filename, 'w');
				file.write(text)
				file.close()
				print "Autobound %s" % filename

parse(file_glob)