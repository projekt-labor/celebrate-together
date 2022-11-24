import os

images = os.listdir()
i = 1

for img in images:
  if img.split(".")[1] != "png": continue
 
  os.system(f"mv {img} avatar{i}.png")
  i+=1

