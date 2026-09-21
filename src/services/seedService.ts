import { supabase } from './supabase'

export async function seedNewUserCatalog(userId: string): Promise<void> {
  if (!userId) return

  try {
    // 1. Check if this user already has any categories
    const { data: existingCats } = await supabase
      .from('categories')
      .select('id')
      .eq('user_id', userId)
      .limit(1)

    if (existingCats && existingCats.length > 0) {
      // User already initialized
      return
    }

    // 2. Insert Starter Categories
    const { data: cats, error: catErr } = await supabase
      .from('categories')
      .insert([
        { name: 'Personal Care', user_id: userId },
        { name: 'Kitchen Appliances', user_id: userId },
        { name: 'Lights', user_id: userId },
        { name: 'Switches', user_id: userId },
        { name: 'Geysers', user_id: userId },
        { name: 'Air Purifiers', user_id: userId }
      ])
      .select()

    if (catErr) {
      console.warn('Could not auto-seed categories:', catErr.message)
      return
    }

    // 3. Insert Starter Brands
    await supabase.from('brands').insert([
      { name: 'Philips', user_id: userId },
      { name: 'Havells', user_id: userId },
      { name: 'Bajaj', user_id: userId },
      { name: 'Crompton', user_id: userId },
      { name: 'Orient', user_id: userId },
      { name: 'Syska', user_id: userId },
      { name: 'Wipro', user_id: userId },
      { name: 'Anchor', user_id: userId },
      { name: 'Legrand', user_id: userId }
    ])

    // 4. Insert Starter Category Specifications
    if (cats && cats.length > 0) {
      const geysers = cats.find((c: any) => c.name === 'Geysers')
      const lights = cats.find((c: any) => c.name === 'Lights')
      const airPurifiers = cats.find((c: any) => c.name === 'Air Purifiers')

      const specsToInsert: any[] = []

      if (geysers) {
        specsToInsert.push(
          { category_id: geysers.id, field_name: 'Capacity', field_type: 'number', unit: 'L', user_id: userId },
          { category_id: geysers.id, field_name: 'Wattage', field_type: 'number', unit: 'W', user_id: userId },
          { category_id: geysers.id, field_name: 'Energy Rating', field_type: 'dropdown', options: ['1 Star', '2 Star', '3 Star', '4 Star', '5 Star'], user_id: userId },
          { category_id: geysers.id, field_name: 'Type', field_type: 'dropdown', options: ['Storage', 'Instant', 'Gas', 'Solar'], user_id: userId }
        )
      }

      if (lights) {
        specsToInsert.push(
          { category_id: lights.id, field_name: 'Wattage', field_type: 'number', unit: 'W', user_id: userId },
          { category_id: lights.id, field_name: 'Lumens', field_type: 'number', unit: 'lm', user_id: userId },
          { category_id: lights.id, field_name: 'Colour Temperature', field_type: 'dropdown', options: ['Warm White (3000K)', 'Neutral White (4000K)', 'Cool White (6500K)'], user_id: userId }
        )
      }

      if (airPurifiers) {
        specsToInsert.push(
          { category_id: airPurifiers.id, field_name: 'Coverage Area', field_type: 'text', user_id: userId },
          { category_id: airPurifiers.id, field_name: 'Filter Type', field_type: 'dropdown', options: ['HEPA', 'Carbon Filter', 'True HEPA + Carbon'], user_id: userId }
        )
      }

      if (specsToInsert.length > 0) {
        await supabase.from('category_specifications').insert(specsToInsert)
      }
    }
  } catch (e) {
    console.error('Error seeding user catalog:', e)
  }
}
