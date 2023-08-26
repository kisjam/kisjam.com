export async function getArchives() {
	const response = await fetch(import.meta.env.WORDPRESS_API_URL, {
		method: 'post',
		headers: {'Content-Type':'application/json'},
		body: JSON.stringify({
			query:
				`
					query {
						posts(first: 10000) {
							nodes {
								date
							}
						}
					}
				`
			})
		});
	const { data } = await response.json();
	const archives = [];

	data.posts.nodes.map((post) => {
		const date = new Date(post.date);
		const year = date.getFullYear();
		const month = date.getMonth() + 1;
		const slug =  `${year}/${month}`;

		if (!archives.includes(slug)) {
			archives.push(slug);
		}
	});
	return archives;
}

export async function getCategories() {
	const response = await fetch(import.meta.env.WORDPRESS_API_URL, {
		method: 'post',
		headers: {'Content-Type':'application/json'},
		body: JSON.stringify({
			query:
				`
					query {
						categories {
							nodes {
								name
								slug
							}
						}
					}
				`
			})
		});
	const { data } = await response.json();
	return data.categories.nodes;
}

export async function getAllPosts() {
	const response = await fetch(import.meta.env.WORDPRESS_API_URL, {
      method: 'post',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
          query: `query GetAllUris {
            posts(first: 10000) {
              nodes {
                id
				title
				date
				uri
				slug
				excerpt
				content
				categories {
					nodes {
						name
						uri
					}
				}
				featuredImage {
					node {
					srcSet
					sourceUrl
					altText
					mediaDetails {
						height
						width
					}
					}
				}
              }
            }
          }
          `
      })
  });
  const { data } = await response.json();

  return data.posts.nodes;
}

export async function getAllPostsByCategory() {
	const response = await fetch(import.meta.env.WORDPRESS_API_URL, {
      method: 'post',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
          query: `query GetAllUris {
			categories {
				nodes {
					id
					name
					slug
					posts(first: 10000) {
						nodes {
							id
							title
							date
							uri
							slug
							excerpt
							content
							categories {
								nodes {
									name
									uri
								}
							}
							featuredImage {
								node {
								srcSet
								sourceUrl
								altText
								mediaDetails {
									height
									width
								}
								}
							}
						}
					}
				}
			}
          }
          `
      })
  });
  const { data } = await response.json();

  return data.categories.nodes;
}
