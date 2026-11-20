
import CategoryProducts from "@/components/category/CategoryProducts"; 

export default async function CategoryPage({ params }) {
  const { id } = await params; 

  return ( 
    <main>
      <CategoryProducts categoryId={id} /> 
    </main> 
  );
}